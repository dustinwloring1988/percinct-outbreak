'use client';

import React, { useState, useEffect } from 'react';
import { statsDB, GameStats } from '@/lib/game/stats-db';
import { WEAPONS } from '@/lib/game/constants';
import { Button } from '@/components/ui/button';

interface StatsScreenProps {
  onBack: () => void;
}

const StatsScreen: React.FC<StatsScreenProps> = ({ onBack }) => {
  const [stats, setStats] = useState<GameStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        // Initialize the database first
        await statsDB.init();
        const loadedStats = await statsDB.getStats();
        setStats(loadedStats);
      } catch (err) {
        setError('Failed to load stats');
        console.error('Error loading stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleResetStats = async () => {
    if (window.confirm('Are you sure you want to reset all stats? This cannot be undone.')) {
      try {
        await statsDB.resetStats();
        setStats(await statsDB.getStats());
      } catch (err) {
        setError('Failed to reset stats');
        console.error('Error resetting stats:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50">
        <div className="text-white text-xl">Loading stats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50">
        <div className="text-white text-xl">Error loading stats: {error}</div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Game Statistics</h2>
          <Button onClick={onBack} variant="outline" className="text-white border-white hover:bg-white/10">
            Back to Menu
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* General Stats */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3">General</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Total Time Played:</span>
                <span className="text-white">{stats ? formatTime(stats.totalTimePlayed) : '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Total Rounds:</span>
                <span className="text-white">{stats ? stats.totalRounds.toLocaleString() : '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Total Kills:</span>
                <span className="text-white">{stats ? stats.totalKills.toLocaleString() : '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Doors Opened:</span>
                <span className="text-white">{stats ? stats.doorsOpened.toLocaleString() : '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Vending Machines Used:</span>
                <span className="text-white">{stats ? stats.vendingMachinesUsed.toLocaleString() : '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Mystery Boxes Opened:</span>
                <span className="text-white">{stats ? stats.mysteryBoxesOpened.toLocaleString() : '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Power-ups Collected:</span>
                <span className="text-white">{stats ? stats.powerUpsCollected.toLocaleString() : '0'}</span>
              </div>
            </div>
          </div>

          {/* Money Stats */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3">Money</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Total Earned:</span>
                <span className="text-white">${stats ? stats.totalMoneyEarned.toLocaleString() : '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Total Spent:</span>
                <span className="text-white">${stats ? stats.totalMoneySpent.toLocaleString() : '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Net Money:</span>
                <span className="text-white">${stats ? (stats.totalMoneyEarned - stats.totalMoneySpent).toLocaleString() : '0'}</span>
              </div>
            </div>
          </div>

          {/* Kills by Weapon */}
          <div className="bg-gray-800 p-4 rounded-lg md:col-span-2 lg:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-3">Kills by Weapon</h3>
            <div className="space-y-2 text-sm max-h-60 overflow-y-auto">
              {WEAPONS.map(weapon => (
                <div key={weapon.id} className="flex justify-between">
                  <span className="text-gray-300">{weapon.name}:</span>
                  <span className="text-white">
                    {stats ? (stats.killsByWeapon[weapon.id] || 0).toLocaleString() : '0'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Button 
            onClick={handleResetStats} 
            variant="destructive" 
            className="px-6 hover:bg-red-700"
          >
            Reset All Stats
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StatsScreen;