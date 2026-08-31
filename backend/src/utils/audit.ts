import prisma from '../prisma/client.js';

export interface LogAuditParams {
  userName?: string;
  action: string;
  recordType: string;
  recordId?: string;
  details?: string;
  previousValue?: any;
  newValue?: any;
}

export async function logAudit(params: LogAuditParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userName: params.userName || 'TFS Admin',
        action: params.action,
        recordType: params.recordType,
        recordId: params.recordId || null,
        details: params.details || null,
        previousValue: params.previousValue ? JSON.stringify(params.previousValue) : null,
        newValue: params.newValue ? JSON.stringify(params.newValue) : null,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
