import { Request, Response, NextFunction } from 'express';
import MemoryCardDataIntegrityChecker from '../utils/memoryCardDataIntegrity';

interface BackupRecord {
  userId: string;
  deckId: string;
  operation: string;
  timestamp: number;
  backupData: any;
}

class MemoryCardDataProtection {
  private static backupHistory: BackupRecord[] = [];
  private static readonly MAX_BACKUP_HISTORY = 100;

  static async createBackup(userId: string, deckId: string, operation: string, data: any): Promise<void> {
    const backup: BackupRecord = {
      userId,
      deckId,
      operation,
      timestamp: Date.now(),
      backupData: JSON.parse(JSON.stringify(data))
    };

    this.backupHistory.unshift(backup);
    
    // Keep only the latest backups
    if (this.backupHistory.length > this.MAX_BACKUP_HISTORY) {
      this.backupHistory = this.backupHistory.slice(0, this.MAX_BACKUP_HISTORY);
    }

    console.log(`Backup created: ${operation} for ${deckId} by ${userId}`);
  }

  static getBackupHistory(userId: string, deckId?: string): BackupRecord[] {
    return this.backupHistory.filter(backup => 
      backup.userId === userId && (!deckId || backup.deckId === deckId)
    ).slice(0, 10); // Return last 10 backups
  }

  static async restoreFromBackup(userId: string, deckId: string, timestamp: number): Promise<any> {
    const backup = this.backupHistory.find(b => 
      b.userId === userId && b.deckId === deckId && b.timestamp === timestamp
    );

    if (!backup) {
      throw new Error('Backup not found');
    }

    console.log(`Restoring backup: ${backup.operation} for ${deckId} from ${new Date(timestamp).toISOString()}`);
    return backup.backupData;
  }

  // Middleware to protect memory card operations
  static protectMemoryCardOperation() {
    return async (req: Request, _res: Response, next: NextFunction) => {
      const { userId, deckId } = req.params;
      const operation = `${req.method} ${req.route?.path || req.path}`;

      // Skip protection for read operations
      if (req.method === 'GET') {
        return next();
      }

      if (!userId || !deckId) {
        return next();
      }

      try {
        // Create backup before operation
        if (req.body && Object.keys(req.body).length > 0) {
          await this.createBackup(userId, deckId, operation, {
            params: req.params,
            body: req.body,
            headers: {
              'user-agent': req.headers['user-agent'],
              'x-forwarded-for': req.headers['x-forwarded-for']
            }
          });
        }

        // Proceed with the operation
        next();

      } catch (error) {
        console.error('Error in memory card data protection middleware:', error);
        // Don't block the operation, just log the error
        next();
      }
    };
  }

  // Middleware to validate data after operations
  static validateAfterOperation() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const originalSend = res.send;

      res.send = function(body: any) {
        // If this was a successful memory card operation, validate the data
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const { userId } = req.params;
          
          if (userId && (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE')) {
            // Run data integrity check asynchronously (don't block response)
            MemoryCardDataIntegrityChecker.checkDataIntegrity(userId)
              .then(report => {
                if (report.corruptedDecks.length > 0 || report.orphanedCards.length > 0) {
                  console.warn(`Data integrity issues detected for user ${userId}:`, report);
                }
              })
              .catch(error => {
                console.error('Error in post-operation data validation:', error);
              });
          }
        }

        return originalSend.call(this, body);
      };

      next();
    };
  }

  // Health check endpoint for memory card data
  static async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.query;
      
      const report = await MemoryCardDataIntegrityChecker.checkDataIntegrity(
        userId as string || undefined
      );

      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        dataIntegrity: {
          totalDecks: report.totalDecks,
          totalCards: report.totalCards,
          issues: report.corruptedDecks.length + report.orphanedCards.length + report.inconsistentStats.length,
          recommendations: report.recommendations
        },
        backupHistory: {
          totalBackups: this.backupHistory.length,
          recentBackups: this.backupHistory.slice(0, 5).map(b => ({
            operation: b.operation,
            timestamp: new Date(b.timestamp).toISOString(),
            deckId: b.deckId
          }))
        }
      };

      if (health.dataIntegrity.issues > 0) {
        health.status = 'degraded';
      }

      res.json(health);

    } catch (error) {
      console.error('Error in memory card health check:', error);
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Failed to perform health check'
      });
    }
  }

  // Emergency repair endpoint
  static async emergencyRepair(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.body;
      
      console.log(`Starting emergency repair for user: ${userId || 'all users'}`);
      
      const repairedCount = await MemoryCardDataIntegrityChecker.repairDataIntegrity(userId);
      
      res.json({
        message: 'Emergency repair completed',
        repairedDecks: repairedCount,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in emergency repair:', error);
      res.status(500).json({
        error: 'Failed to perform emergency repair',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
}

export default MemoryCardDataProtection; 