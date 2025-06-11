// Script to check and analyze music genres
require('dotenv').config();
const { connectToDb, getDb } = require('./db');
const fs = require('fs');
const path = require('path');

// Configuration
const initiatedBy = 'hsyen78444'; // User who initiated this operation
const initiatedAt = '2025-06-11 08:23:08'; // When this operation was initiated

// Connect to database
let db;
connectToDb(async (err) => {
    if (err) {
        console.error(`[${new Date().toISOString()}] Failed to connect to database:`, err);
        process.exit(1);
    }
    
    console.log(`[${new Date().toISOString()}] Connected to database. Starting music genres analysis...`);
    console.log(`[${new Date().toISOString()}] Analysis initiated by: ${initiatedBy} at ${initiatedAt}`);
    db = getDb();
    
    try {
        await checkMusicGenres();
        console.log(`[${new Date().toISOString()}] Music genres analysis completed!`);
        process.exit(0);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error during analysis:`, error);
        process.exit(1);
    }
});

async function checkMusicGenres() {
    const startTime = new Date();
    const formattedStartTime = startTime.toISOString();
    
    // Log this operation
    await db.collection('ActivityLogs').insertOne({
        action: 'check_music_genres',
        initiatedBy,
        startTime: formattedStartTime,
        status: 'started'
    });
    
    // Get all music from the collection
    const allMusic = await db.collection('Music').find({}).toArray();
    console.log(`[${new Date().toISOString()}] Found ${allMusic.length} music tracks in collection`);
    
    // Initialize analysis
    const analysis = {
        totalTracks: allMusic.length,
        genreStatistics: {
            withGenre: 0,
            withoutGenre: 0,
            emptyGenre: 0,
            unknownGenre: 0,
            uniqueGenres: new Set(),
            genreCounts: {},
            genreDistribution: []
        },
        fieldPresence: {
            genre: 0,
            name: 0,
            artists: 0,
            release: 0,
            popularity: 0,
            poster_url: 0,
            duration_ms: 0,
            explicit: 0
        },
        artistStatistics: {
            uniqueArtists: new Set(),
            artistCounts: {},
            topArtists: []
        },
        missingData: {
            noGenre: [],
            noName: [],
            noArtists: [],
            noRelease: [],
            noPopularity: [],
            noPoster: [],
            noDuration: []
        },
        dataQualityIssues: {
            duplicateNames: [],
            invalidPopularity: [],
            invalidDuration: [],
            invalidReleaseDates: []
        },
        sampleTracks: []
    };
    
    // Track duplicates
    const nameTracker = {};
    
    // Analyze each music track
    console.log(`[${new Date().toISOString()}] Analyzing music data...`);
    
    for (let i = 0; i < allMusic.length; i++) {
        const track = allMusic[i];
        
        // Progress indicator
        if (i % 1000 === 0) {
            console.log(`[${new Date().toISOString()}] Processed ${i}/${allMusic.length} tracks (${((i/allMusic.length)*100).toFixed(1)}%)`);
        }
        
        // Check field presence
        Object.keys(analysis.fieldPresence).forEach(field => {
            if (track[field] !== undefined && track[field] !== null && track[field] !== '') {
                analysis.fieldPresence[field]++;
            }
        });
        
        // Analyze genre
        if (track.genre) {
            const genre = track.genre.toString().trim();
            
            if (genre === '' || genre.toLowerCase() === 'null') {
                analysis.genreStatistics.emptyGenre++;
                analysis.missingData.noGenre.push({
                    _id: track._id,
                    name: track.name || 'No Name',
                    artists: track.artists ? track.artists.join(', ') : 'No Artists'
                });
            } else if (genre.toLowerCase() === 'unknown') {
                analysis.genreStatistics.unknownGenre++;
            } else {
                analysis.genreStatistics.withGenre++;
                
                // Normalize genre (capitalize first letter)
                const normalizedGenre = genre.charAt(0).toUpperCase() + genre.slice(1).toLowerCase();
                
                analysis.genreStatistics.uniqueGenres.add(normalizedGenre);
                analysis.genreStatistics.genreCounts[normalizedGenre] = 
                    (analysis.genreStatistics.genreCounts[normalizedGenre] || 0) + 1;
            }
        } else {
            analysis.genreStatistics.withoutGenre++;
            analysis.missingData.noGenre.push({
                _id: track._id,
                name: track.name || 'No Name',
                artists: track.artists ? track.artists.join(', ') : 'No Artists'
            });
        }
        
        // Analyze artists
        if (track.artists && Array.isArray(track.artists)) {
            track.artists.forEach(artist => {
                if (artist && artist.trim() !== '') {
                    analysis.artistStatistics.uniqueArtists.add(artist);
                    analysis.artistStatistics.artistCounts[artist] = 
                        (analysis.artistStatistics.artistCounts[artist] || 0) + 1;
                }
            });
        } else if (!track.artists) {
            analysis.missingData.noArtists.push({
                _id: track._id,
                name: track.name || 'No Name',
                genre: track.genre || 'No Genre'
            });
        }
        
        // Check for missing fields
        if (!track.name || track.name.trim() === '') {
            analysis.missingData.noName.push({
                _id: track._id,
                artists: track.artists ? track.artists.join(', ') : 'No Artists',
                genre: track.genre || 'No Genre'
            });
        }
        
        if (!track.release) {
            analysis.missingData.noRelease.push({
                _id: track._id,
                name: track.name || 'No Name',
                artists: track.artists ? track.artists.join(', ') : 'No Artists'
            });
        }
        
        if (!track.popularity || track.popularity === 0) {
            analysis.missingData.noPopularity.push({
                _id: track._id,
                name: track.name || 'No Name',
                artists: track.artists ? track.artists.join(', ') : 'No Artists'
            });
        }
        
        if (!track.poster_url || track.poster_url.trim() === '') {
            analysis.missingData.noPoster.push({
                _id: track._id,
                name: track.name || 'No Name',
                artists: track.artists ? track.artists.join(', ') : 'No Artists'
            });
        }
        
        if (!track.duration_ms || track.duration_ms === 0) {
            analysis.missingData.noDuration.push({
                _id: track._id,
                name: track.name || 'No Name',
                artists: track.artists ? track.artists.join(', ') : 'No Artists'
            });
        }
        
        // Check for data quality issues
        if (track.name) {
            const nameKey = track.name.toLowerCase().trim();
            if (nameTracker[nameKey]) {
                analysis.dataQualityIssues.duplicateNames.push({
                    name: track.name,
                    tracks: [nameTracker[nameKey], {
                        _id: track._id,
                        artists: track.artists
                    }]
                });
            } else {
                nameTracker[nameKey] = {
                    _id: track._id,
                    artists: track.artists
                };
            }
        }
        
        // Check invalid popularity
        if (track.popularity && (track.popularity < 0 || track.popularity > 100)) {
            analysis.dataQualityIssues.invalidPopularity.push({
                _id: track._id,
                name: track.name,
                popularity: track.popularity
            });
        }
        
        // Check invalid duration
        if (track.duration_ms && track.duration_ms < 0) {
            analysis.dataQualityIssues.invalidDuration.push({
                _id: track._id,
                name: track.name,
                duration_ms: track.duration_ms
            });
        }
        
        // Check invalid release dates
        if (track.release) {
            try {
                const releaseDate = new Date(track.release);
                if (isNaN(releaseDate.getTime()) || releaseDate.getFullYear() < 1900 || releaseDate.getFullYear() > new Date().getFullYear() + 5) {
                    analysis.dataQualityIssues.invalidReleaseDates.push({
                        _id: track._id,
                        name: track.name,
                        release: track.release
                    });
                }
            } catch (error) {
                analysis.dataQualityIssues.invalidReleaseDates.push({
                    _id: track._id,
                    name: track.name,
                    release: track.release
                });
            }
        }
        
        // Collect sample tracks for each genre (first 3 per genre)
        if (track.genre && track.genre.trim() !== '') {
            const normalizedGenre = track.genre.charAt(0).toUpperCase() + track.genre.slice(1).toLowerCase();
            const existingSamples = analysis.sampleTracks.filter(s => s.genre === normalizedGenre);
            
            if (existingSamples.length < 3) {
                analysis.sampleTracks.push({
                    _id: track._id,
                    name: track.name || 'No Name',
                    artists: track.artists ? track.artists.join(', ') : 'No Artists',
                    genre: normalizedGenre,
                    popularity: track.popularity || 0,
                    release: track.release || 'Unknown'
                });
            }
        }
    }
    
    // Convert Sets to Arrays and create distributions
    analysis.genreStatistics.uniqueGenres = Array.from(analysis.genreStatistics.uniqueGenres);
    analysis.genreStatistics.genreDistribution = Object.entries(analysis.genreStatistics.genreCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([genre, count]) => ({
            genre,
            count,
            percentage: ((count / analysis.totalTracks) * 100).toFixed(2) + '%'
        }));
    
    analysis.artistStatistics.uniqueArtists = Array.from(analysis.artistStatistics.uniqueArtists);
    analysis.artistStatistics.topArtists = Object.entries(analysis.artistStatistics.artistCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([artist, count]) => ({
            artist,
            count,
            percentage: ((count / analysis.totalTracks) * 100).toFixed(2) + '%'
        }));
    
    const endTime = new Date();
    const formattedEndTime = endTime.toISOString();
    const duration = (endTime - startTime) / 1000;
    
    // Generate report
    console.log(`\n[${new Date().toISOString()}] ===============================================`);
    console.log(`[${new Date().toISOString()}] MUSIC COLLECTION GENRE ANALYSIS REPORT`);
    console.log(`[${new Date().toISOString()}] ===============================================`);
    console.log(`[${new Date().toISOString()}] Analysis initiated by: ${initiatedBy}`);
    console.log(`[${new Date().toISOString()}] Analysis time: ${initiatedAt}`);
    console.log(`[${new Date().toISOString()}] Duration: ${duration.toFixed(2)} seconds`);
    console.log(`[${new Date().toISOString()}] Total tracks analyzed: ${analysis.totalTracks}`);
    
    console.log(`\n[${new Date().toISOString()}] FIELD PRESENCE ANALYSIS:`);
    Object.entries(analysis.fieldPresence).forEach(([field, count]) => {
        const percentage = ((count / analysis.totalTracks) * 100).toFixed(2);
        console.log(`[${new Date().toISOString()}] ${field}: ${count} (${percentage}%)`);
    });
    
    console.log(`\n[${new Date().toISOString()}] GENRE STATISTICS:`);
    console.log(`[${new Date().toISOString()}] Tracks with valid genre: ${analysis.genreStatistics.withGenre}`);
    console.log(`[${new Date().toISOString()}] Tracks without genre: ${analysis.genreStatistics.withoutGenre}`);
    console.log(`[${new Date().toISOString()}] Tracks with empty genre: ${analysis.genreStatistics.emptyGenre}`);
    console.log(`[${new Date().toISOString()}] Tracks with 'unknown' genre: ${analysis.genreStatistics.unknownGenre}`);
    console.log(`[${new Date().toISOString()}] Unique genres found: ${analysis.genreStatistics.uniqueGenres.length}`);
    
    console.log(`\n[${new Date().toISOString()}] GENRE DISTRIBUTION:`);
    analysis.genreStatistics.genreDistribution.forEach((item, index) => {
        console.log(`[${new Date().toISOString()}] ${index + 1}. ${item.genre}: ${item.count} tracks (${item.percentage})`);
    });
    
    console.log(`\n[${new Date().toISOString()}] UNIQUE GENRES FOUND:`);
    analysis.genreStatistics.uniqueGenres.forEach((genre, index) => {
        console.log(`[${new Date().toISOString()}] ${index + 1}. ${genre}`);
    });
    
    console.log(`\n[${new Date().toISOString()}] ARTIST STATISTICS:`);
    console.log(`[${new Date().toISOString()}] Unique artists: ${analysis.artistStatistics.uniqueArtists.length}`);
    console.log(`[${new Date().toISOString()}] Top 10 artists:`);
    analysis.artistStatistics.topArtists.slice(0, 10).forEach((item, index) => {
        console.log(`[${new Date().toISOString()}] ${index + 1}. ${item.artist}: ${item.count} tracks (${item.percentage})`);
    });
    
    console.log(`\n[${new Date().toISOString()}] DATA QUALITY ISSUES:`);
    console.log(`[${new Date().toISOString()}] Missing genres: ${analysis.missingData.noGenre.length}`);
    console.log(`[${new Date().toISOString()}] Missing names: ${analysis.missingData.noName.length}`);
    console.log(`[${new Date().toISOString()}] Missing artists: ${analysis.missingData.noArtists.length}`);
    console.log(`[${new Date().toISOString()}] Missing release dates: ${analysis.missingData.noRelease.length}`);
    console.log(`[${new Date().toISOString()}] Missing popularity: ${analysis.missingData.noPopularity.length}`);
    console.log(`[${new Date().toISOString()}] Missing posters: ${analysis.missingData.noPoster.length}`);
    console.log(`[${new Date().toISOString()}] Missing duration: ${analysis.missingData.noDuration.length}`);
    console.log(`[${new Date().toISOString()}] Duplicate names: ${analysis.dataQualityIssues.duplicateNames.length}`);
    console.log(`[${new Date().toISOString()}] Invalid popularity: ${analysis.dataQualityIssues.invalidPopularity.length}`);
    console.log(`[${new Date().toISOString()}] Invalid duration: ${analysis.dataQualityIssues.invalidDuration.length}`);
    console.log(`[${new Date().toISOString()}] Invalid release dates: ${analysis.dataQualityIssues.invalidReleaseDates.length}`);
    
    // Create detailed report
    const summary = {
        metadata: {
            analysisDate: formattedEndTime,
            initiatedBy,
            initiatedAt,
            duration: `${duration.toFixed(2)} seconds`,
            collection: 'Music'
        },
        ...analysis,
        status: 'completed'
    };
    
    // Save report to file
    const reportFileName = `music_genres_analysis_${Date.now()}.json`;
    const reportFilePath = path.join(__dirname, reportFileName);
    
    try {
        fs.writeFileSync(reportFilePath, JSON.stringify(summary, null, 2));
        console.log(`\n[${new Date().toISOString()}] Detailed report saved to: ${reportFilePath}`);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Failed to save report file:`, error.message);
    }
    
    // Log to database
    await db.collection('ActivityLogs').insertOne(summary);
    
    console.log(`\n[${formattedEndTime}] Music genre analysis completed successfully!`);
    
    return summary;
}