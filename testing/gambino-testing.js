const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class GambinoTestingSystem {
    constructor() {
        this.players = new Map();
        this.stores = new Map();
        this.transactions = [];
        this.metrics = {
            totalVolume: 0,
            totalPlayers: 0,
            totalStores: 0,
            totalGames: 0,
            totalJackpots: 0,
            avgSessionTime: 0,
            retentionRate: 0
        };
        
        // Mock prices and settings
        this.gambinoPrice = 0.001; // $0.001 per GAMBINO
        this.priceVolatility = 0.05; // 5% volatility for testing
        this.jackpotPools = {
            minor: 1000000, // 1M GAMBINO
            major: 5000000, // 5M GAMBINO  
            mega: 25000000  // 25M GAMBINO
        };

        this.dataDir = './gambino_data';
        this.ensureDataDirectory();
    }

    async ensureDataDirectory() {
        try {
            await fs.mkdir(this.dataDir, { recursive: true });
        } catch (error) {
            console.log('Data directory exists or created');
        }
    }

    // Generate unique IDs
    generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    }

    // Create a test player account
    async createPlayer(playerId = null, storeId, playerName = null) {
        playerId = playerId || this.generateId('player');
        
        const player = {
            id: playerId,
            name: playerName || `Player ${playerId.slice(-6)}`,
            storeId: storeId,
            
            // Balances
            gambinoBalance: 0,
            totalDeposited: 0,
            totalWithdrawn: 0,
            netProfit: 0,
            
            // Game stats
            gamesPlayed: 0,
            totalSpent: 0,
            totalWon: 0,
            jackpotsHit: 0,
            gluckScore: 0,
            tier: 'Bronze',
            
            // Session tracking
            sessionsCount: 0,
            totalSessionTime: 0,
            avgSessionTime: 0,
            lastActivity: new Date(),
            
            // Lucky events tracking
            luckyEvents: [],
            winStreak: 0,
            maxWinStreak: 0,
            
            createdAt: new Date()
        };

        this.players.set(playerId, player);
        await this.savePlayerData(player);
        
        // Update store player count
        if (this.stores.has(storeId)) {
            this.stores.get(storeId).playersCount++;
        }

        console.log(`✅ Created player: ${playerId} for store: ${storeId}`);
        return player;
    }

    // Create a test store
    async createStore(storeId = null, storeName = null, feePercentage = 5) {
        storeId = storeId || this.generateId('store');
        
        const store = {
            id: storeId,
            name: storeName || `Store ${storeId.slice(-6)}`,
            feePercentage: feePercentage,
            
            // Revenue tracking
            totalRevenue: 0,
            totalFees: 0,
            gambinoBalance: 0,
            
            // Player metrics
            playersCount: 0,
            activePlayersToday: 0,
            avgPlayerValue: 0,
            
            // Machine metrics (8 machines per store)
            machinesCount: 8,
            avgRevenuePerMachine: 0,
            machineUtilization: 0,
            
            // Performance
            dailyVolume: 0,
            weeklyVolume: 0,
            monthlyVolume: 0,
            
            status: 'active',
            createdAt: new Date(),
            lastActivity: new Date()
        };

        this.stores.set(storeId, store);
        await this.saveStoreData(store);
        
        console.log(`🏪 Created store: ${storeId} (${store.name})`);
        return store;
    }

    // Simulate cash deposit
    async deposit(playerId, cashAmount) {
        const player = this.players.get(playerId);
        if (!player) throw new Error('Player not found');

        const store = this.stores.get(player.storeId);
        if (!store) throw new Error('Store not found');

        // Calculate GAMBINO amount with simulated price volatility
        const currentPrice = this.getSimulatedPrice();
        const gambinoAmount = Math.floor(cashAmount / currentPrice);
        
        // Store owner fee
        const storeFee = Math.floor(gambinoAmount * (store.feePercentage / 100));
        const playerAmount = gambinoAmount - storeFee;

        // Update player
        player.gambinoBalance += playerAmount;
        player.totalDeposited += cashAmount;
        player.lastActivity = new Date();

        // Update store
        store.totalFees += (storeFee * currentPrice);
        store.gambinoBalance += storeFee;
        store.totalRevenue += cashAmount;
        store.lastActivity = new Date();

        // Log transaction
        const transaction = {
            id: this.generateId('txn'),
            type: 'deposit',
            playerId: playerId,
            storeId: player.storeId,
            cashAmount: cashAmount,
            gambinoAmount: playerAmount,
            storeFee: storeFee,
            price: currentPrice,
            timestamp: new Date()
        };

        this.transactions.push(transaction);
        await this.logTransaction(transaction);

        // Update metrics
        this.metrics.totalVolume += cashAmount;
        
        console.log(`💰 Deposit: $${cashAmount} → ${playerAmount} GAMBINO for ${playerId}`);
        
        return {
            success: true,
            gambinoReceived: playerAmount,
            storeFee: storeFee,
            currentPrice: currentPrice,
            newBalance: player.gambinoBalance
        };
    }

    // Simulate gameplay
    async playGame(playerId, gambinoSpent, gameType = 'standard') {
        const player = this.players.get(playerId);
        if (!player) throw new Error('Player not found');
        if (player.gambinoBalance < gambinoSpent) throw new Error('Insufficient balance');

        // Game outcome simulation
        const gameResult = this.simulateGameOutcome(gameType, gambinoSpent);
        
        // Update player stats
        player.gambinoBalance -= gambinoSpent;
        player.gamesPlayed++;
        player.totalSpent += gambinoSpent;
        player.lastActivity = new Date();

        let jackpotWin = 0;
        let gluckBonus = 1;

        // Handle jackpot
        if (gameResult.isJackpot) {
            jackpotWin = this.calculateJackpot(gameResult.jackpotType);
            player.gambinoBalance += jackpotWin;
            player.totalWon += jackpotWin;
            player.jackpotsHit++;
            player.winStreak++;
            player.maxWinStreak = Math.max(player.maxWinStreak, player.winStreak);
            
            gluckBonus = this.calculateGluckBonus(gameResult.jackpotType);
            
            // Log lucky event
            player.luckyEvents.push({
                type: gameResult.jackpotType,
                amount: jackpotWin,
                timestamp: new Date(),
                gluckBonus: gluckBonus
            });

            this.metrics.totalJackpots++;
        } else {
            player.winStreak = 0;
        }

        // Update Glück Score
        player.gluckScore += gluckBonus;
        player.tier = this.calculateTier(player.gluckScore, player.gamesPlayed);

        // Log transaction
        const transaction = {
            id: this.generateId('txn'),
            type: 'game',
            playerId: playerId,
            storeId: player.storeId,
            gambinoSpent: gambinoSpent,
            jackpotWin: jackpotWin,
            isJackpot: gameResult.isJackpot,
            jackpotType: gameResult.jackpotType,
            gluckBonus: gluckBonus,
            gameType: gameType,
            timestamp: new Date()
        };

        this.transactions.push(transaction);
        await this.logTransaction(transaction);

        this.metrics.totalGames++;

        console.log(`🎰 Game: ${playerId} spent ${gambinoSpent}, ${gameResult.isJackpot ? `WON ${jackpotWin} JACKPOT!` : 'no win'}`);

        return {
            success: true,
            gambinoSpent: gambinoSpent,
            jackpotWin: jackpotWin,
            isJackpot: gameResult.isJackpot,
            jackpotType: gameResult.jackpotType,
            newBalance: player.gambinoBalance,
            gluckScore: player.gluckScore,
            tier: player.tier,
            winStreak: player.winStreak
        };
    }

    // Simulate cash out
    async cashOut(playerId, gambinoAmount) {
        const player = this.players.get(playerId);
        if (!player) throw new Error('Player not found');
        if (player.gambinoBalance < gambinoAmount) throw new Error('Insufficient balance');

        const currentPrice = this.getSimulatedPrice();
        const cashValue = gambinoAmount * currentPrice;
        
        // Apply 2% withdrawal fee
        const fee = cashValue * 0.02;
        const netCashOut = cashValue - fee;

        // Update player
        player.gambinoBalance -= gambinoAmount;
        player.totalWithdrawn += netCashOut;
        player.netProfit = player.totalWithdrawn - player.totalDeposited;
        player.lastActivity = new Date();

        // Log transaction
        const transaction = {
            id: this.generateId('txn'),
            type: 'cashout',
            playerId: playerId,
            storeId: player.storeId,
            gambinoAmount: gambinoAmount,
            cashValue: netCashOut,
            fee: fee,
            price: currentPrice,
            timestamp: new Date()
        };

        this.transactions.push(transaction);
        await this.logTransaction(transaction);

        console.log(`💸 Cashout: ${playerId} cashed out ${gambinoAmount} GAMBINO for $${netCashOut.toFixed(2)}`);

        return {
            success: true,
            gambinoCashedOut: gambinoAmount,
            cashValue: netCashOut,
            fee: fee,
            newBalance: player.gambinoBalance
        };
    }

    // Simulate game outcomes
    simulateGameOutcome(gameType, betAmount) {
        const random = Math.random();
        
        // Different jackpot probabilities based on bet size
        const betMultiplier = Math.min(betAmount / 1000, 5); // Higher bets = better odds
        
        if (random < 0.001 * betMultiplier) { // Mega jackpot
            return { isJackpot: true, jackpotType: 'mega' };
        } else if (random < 0.01 * betMultiplier) { // Major jackpot
            return { isJackpot: true, jackpotType: 'major' };
        } else if (random < 0.05 * betMultiplier) { // Minor jackpot
            return { isJackpot: true, jackpotType: 'minor' };
        }
        
        return { isJackpot: false, jackpotType: null };
    }

    // Calculate jackpot amounts
    calculateJackpot(jackpotType) {
        const baseAmounts = {
            minor: 5000,   // 5K GAMBINO
            major: 50000,  // 50K GAMBINO
            mega: 500000   // 500K GAMBINO
        };
        
        // Add some randomness
        const variance = 0.3; // 30% variance
        const multiplier = 1 + (Math.random() - 0.5) * variance;
        
        return Math.floor(baseAmounts[jackpotType] * multiplier);
    }

    // Calculate Glück bonus points
    calculateGluckBonus(jackpotType) {
        const bonuses = {
            minor: 10,
            major: 50,
            mega: 200
        };
        return bonuses[jackpotType] || 1;
    }

    // Calculate player tier
    calculateTier(gluckScore, gamesPlayed) {
        if (gluckScore >= 10000 && gamesPlayed >= 1000) return 'Diamond';
        if (gluckScore >= 5000 && gamesPlayed >= 500) return 'Platinum';
        if (gluckScore >= 1000 && gamesPlayed >= 100) return 'Gold';
        if (gluckScore >= 100 && gamesPlayed >= 25) return 'Silver';
        return 'Bronze';
    }

    // Simulate price with volatility
    getSimulatedPrice() {
        const volatility = (Math.random() - 0.5) * this.priceVolatility;
        return this.gambinoPrice * (1 + volatility);
    }

    // Batch create test data
    async createTestData(storeCount = 3, playersPerStore = 10) {
        console.log(`🧪 Creating test data: ${storeCount} stores, ${playersPerStore} players each`);
        
        const stores = [];
        const players = [];

        // Create stores
        for (let i = 0; i < storeCount; i++) {
            const store = await this.createStore(
                null,
                `Test Store ${i + 1}`,
                5 + (i * 2) // Varying fee percentages
            );
            stores.push(store);
        }

        // Create players for each store
        for (const store of stores) {
            for (let i = 0; i < playersPerStore; i++) {
                const player = await this.createPlayer(
                    null,
                    store.id,
                    `Player ${i + 1}`
                );
                players.push(player);

                // Simulate some initial activity
                await this.deposit(player.id, 20 + (Math.random() * 80)); // $20-100 deposits
                
                // Play some games
                const gamesToPlay = 3 + Math.floor(Math.random() * 7); // 3-10 games
                for (let j = 0; j < gamesToPlay; j++) {
                    const betAmount = 100 + Math.floor(Math.random() * 500); // 100-600 GAMBINO bets
                    if (player.gambinoBalance >= betAmount) {
                        await this.playGame(player.id, betAmount);
                    }
                }
            }
        }

        console.log(`✅ Test data created: ${stores.length} stores, ${players.length} players`);
        return { stores, players };
    }

    // Generate metrics report
    async generateMetricsReport() {
        const report = {
            timestamp: new Date(),
            overview: {
                totalStores: this.stores.size,
                totalPlayers: this.players.size,
                totalTransactions: this.transactions.length,
                totalVolume: this.metrics.totalVolume,
                totalGames: this.metrics.totalGames,
                totalJackpots: this.metrics.totalJackpots
            },
            playerMetrics: this.getPlayerMetrics(),
            storeMetrics: this.getStoreMetrics(),
            gameMetrics: this.getGameMetrics(),
            tokenMetrics: this.getTokenMetrics()
        };

        await this.saveReport(report);
        return report;
    }

    getPlayerMetrics() {
        const players = Array.from(this.players.values());
        
        return {
            avgDeposit: players.reduce((sum, p) => sum + p.totalDeposited, 0) / players.length,
            avgGamesPlayed: players.reduce((sum, p) => sum + p.gamesPlayed, 0) / players.length,
            avgGluckScore: players.reduce((sum, p) => sum + p.gluckScore, 0) / players.length,
            tierDistribution: this.getTierDistribution(),
            topPlayers: players
                .sort((a, b) => b.gluckScore - a.gluckScore)
                .slice(0, 10)
                .map(p => ({
                    id: p.id,
                    name: p.name,
                    gluckScore: p.gluckScore,
                    tier: p.tier,
                    jackpotsHit: p.jackpotsHit
                }))
        };
    }

    getStoreMetrics() {
        const stores = Array.from(this.stores.values());
        
        return {
            avgRevenue: stores.reduce((sum, s) => sum + s.totalRevenue, 0) / stores.length,
            avgPlayersPerStore: stores.reduce((sum, s) => sum + s.playersCount, 0) / stores.length,
            topStores: stores
                .sort((a, b) => b.totalRevenue - a.totalRevenue)
                .slice(0, 5)
                .map(s => ({
                    id: s.id,
                    name: s.name,
                    revenue: s.totalRevenue,
                    players: s.playersCount,
                    avgRevenuePerPlayer: s.totalRevenue / Math.max(s.playersCount, 1)
                }))
        };
    }

    getGameMetrics() {
        const gameTransactions = this.transactions.filter(t => t.type === 'game');
        const jackpots = gameTransactions.filter(t => t.isJackpot);
        
        return {
            totalGames: gameTransactions.length,
            totalJackpots: jackpots.length,
            jackpotRate: jackpots.length / gameTransactions.length,
            avgBetSize: gameTransactions.reduce((sum, t) => sum + t.gambinoSpent, 0) / gameTransactions.length,
            jackpotDistribution: {
                minor: jackpots.filter(j => j.jackpotType === 'minor').length,
                major: jackpots.filter(j => j.jackpotType === 'major').length,
                mega: jackpots.filter(j => j.jackpotType === 'mega').length
            }
        };
    }

    getTokenMetrics() {
        const players = Array.from(this.players.values());
        const totalGambinoHeld = players.reduce((sum, p) => sum + p.gambinoBalance, 0);
        
        return {
            totalGambinoInCirculation: totalGambinoHeld,
            avgGambinoPerPlayer: totalGambinoHeld / players.length,
            currentPrice: this.getSimulatedPrice(),
            totalMarketValue: totalGambinoHeld * this.getSimulatedPrice()
        };
    }

    getTierDistribution() {
        const players = Array.from(this.players.values());
        const distribution = {};
        
        players.forEach(player => {
            distribution[player.tier] = (distribution[player.tier] || 0) + 1;
        });
        
        return distribution;
    }

    // Save data functions
    async savePlayerData(player) {
        const filePath = path.join(this.dataDir, `player_${player.id}.json`);
        await fs.writeFile(filePath, JSON.stringify(player, null, 2));
    }

    async saveStoreData(store) {
        const filePath = path.join(this.dataDir, `store_${store.id}.json`);
        await fs.writeFile(filePath, JSON.stringify(store, null, 2));
    }

    async logTransaction(transaction) {
        const filePath = path.join(this.dataDir, 'transactions.jsonl');
        await fs.appendFile(filePath, JSON.stringify(transaction) + '\n');
    }

    async saveReport(report) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filePath = path.join(this.dataDir, `metrics_report_${timestamp}.json`);
        await fs.writeFile(filePath, JSON.stringify(report, null, 2));
        console.log(`📊 Report saved: ${filePath}`);
    }

    // Export all data
    async exportAllData() {
        const exportData = {
            players: Array.from(this.players.entries()),
            stores: Array.from(this.stores.entries()),
            transactions: this.transactions,
            metrics: this.metrics,
            exportedAt: new Date()
        };

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filePath = path.join(this.dataDir, `full_export_${timestamp}.json`);
        await fs.writeFile(filePath, JSON.stringify(exportData, null, 2));
        
        console.log(`📦 Full export saved: ${filePath}`);
        return filePath;
    }
}

// Example usage function
async function runTestScenario() {
    const system = new GambinoTestingSystem();
    
    console.log('🚀 Starting Gambino Testing System...');
    
    // Create test data
    await system.createTestData(3, 15); // 3 stores, 15 players each
    
    // Run some additional simulations
    console.log('\n🎯 Running additional simulations...');
    
    const players = Array.from(system.players.keys());
    for (let i = 0; i < 100; i++) {
        const randomPlayer = players[Math.floor(Math.random() * players.length)];
        const player = system.players.get(randomPlayer);
        
        if (player.gambinoBalance > 500) {
            await system.playGame(randomPlayer, 200 + Math.floor(Math.random() * 300));
        }
    }
    
    // Generate final report
    console.log('\n📊 Generating metrics report...');
    const report = await system.generateMetricsReport();
    
    console.log('\n=== METRICS SUMMARY ===');
    console.log(`Total Volume: $${report.overview.totalVolume.toFixed(2)}`);
    console.log(`Total Players: ${report.overview.totalPlayers}`);
    console.log(`Total Games: ${report.overview.totalGames}`);
    console.log(`Total Jackpots: ${report.overview.totalJackpots}`);
    console.log(`Jackpot Rate: ${(report.gameMetrics.jackpotRate * 100).toFixed(2)}%`);
    console.log(`Avg Glück Score: ${report.playerMetrics.avgGluckScore.toFixed(0)}`);
    
    // Export everything
    await system.exportAllData();
    
    return system;
}

// Quick test function
async function quickTest() {
    console.log('🎲 Quick Gambino Test...');
    const system = new GambinoTestingSystem();
    
    const store = await system.createStore('test_store', 'Test Store', 5);
    const player = await system.createPlayer('test_player', store.id, 'Test Player');
    
    await system.deposit(player.id, 50);
    await system.playGame(player.id, 1000);
    
    console.log(`✅ Player balance: ${player.gambinoBalance} GAMBINO`);
    return system;
}

// Export functions
module.exports = { 
    GambinoTestingSystem, 
    runTestScenario,
    quickTest
};
