import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { guidanceApi } from '../services/api';

const GuidanceContext = createContext(null);

export function GuidanceProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all guidance requests for current user
  const loadRequests = useCallback(async () => {
    if (!isAuthenticated) {
      setSentRequests([]);
      setReceivedRequests([]);
      return;
    }

    try {
      setIsLoading(true);
      const [sentRes, receivedRes] = await Promise.all([
        guidanceApi.getSentGuidanceRequests(),
        guidanceApi.getReceivedGuidanceRequests()
      ]);

      if (sentRes.success && Array.isArray(sentRes.data)) {
        setSentRequests(sentRes.data);
      }
      if (receivedRes.success && Array.isArray(receivedRes.data)) {
        setReceivedRequests(receivedRes.data);
      }
    } catch (err) {
      console.warn('Could not load guidance requests from backend:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  /**
   * Send guidance request to a mentor
   */
  const sendGuidanceRequest = useCallback(
    async (requestData) => {
      try {
        const payload = {
          mentorId: requestData.mentorId || requestData.id,
          topic: Array.isArray(requestData.topics)
            ? requestData.topics.join(', ')
            : requestData.topic || 'General Career Guidance',
          message: requestData.message || 'I would like to request your guidance.',
          targetCompany: requestData.targetCompany || '',
          targetRole: requestData.targetRole || ''
        };

        const res = await guidanceApi.sendGuidanceRequest(payload);
        if (res.success) {
          addToast({
            title: 'Guidance request sent successfully.',
            message: `Your request was delivered to ${requestData.mentorName || 'the mentor'}.`,
            type: 'success'
          });
          await loadRequests();
          return res;
        }
      } catch (err) {
        addToast({
          title: 'Error Sending Request',
          message: err.message || 'Could not send guidance request.',
          type: 'error'
        });
        throw err;
      }
    },
    [addToast, loadRequests]
  );

  /**
   * Accept incoming guidance request
   */
  const acceptReceivedRequest = useCallback(
    async (id, responseMessage = '') => {
      try {
        const res = await guidanceApi.acceptGuidanceRequest(id, { responseMessage });
        if (res.success) {
          setReceivedRequests((prev) =>
            prev.map((req) =>
              req.id === id || req._id === id
                ? {
                    ...req,
                    status: 'Accepted',
                    statusNote: responseMessage || 'You accepted this guidance request.'
                  }
                : req
            )
          );
          addToast({
            title: 'Guidance request accepted.',
            message: 'You have accepted the guidance request.',
            type: 'success'
          });
          loadRequests();
        }
      } catch (err) {
        addToast({
          title: 'Action Error',
          message: err.message || 'Could not accept guidance request.',
          type: 'error'
        });
      }
    },
    [addToast, loadRequests]
  );

  /**
   * Reject incoming guidance request
   */
  const rejectReceivedRequest = useCallback(
    async (id, responseMessage = '') => {
      try {
        const res = await guidanceApi.rejectGuidanceRequest(id, { responseMessage });
        if (res.success) {
          setReceivedRequests((prev) =>
            prev.map((req) =>
              req.id === id || req._id === id
                ? {
                    ...req,
                    status: 'Rejected',
                    statusNote: responseMessage || 'You declined this request.'
                  }
                : req
            )
          );
          addToast({
            title: 'Guidance request rejected.',
            message: 'You have declined the guidance request.',
            type: 'info'
          });
          loadRequests();
        }
      } catch (err) {
        addToast({
          title: 'Action Error',
          message: err.message || 'Could not reject guidance request.',
          type: 'error'
        });
      }
    },
    [addToast, loadRequests]
  );

  /**
   * Cancel outgoing guidance request
   */
  const cancelSentRequest = useCallback(
    async (id) => {
      try {
        const res = await guidanceApi.cancelGuidanceRequest(id);
        if (res.success) {
          setSentRequests((prev) =>
            prev.map((req) =>
              req.id === id || req._id === id
                ? {
                    ...req,
                    status: 'Cancelled',
                    statusNote: 'You cancelled this request.'
                  }
                : req
            )
          );
          addToast({
            title: 'Guidance request cancelled.',
            message: 'Your request has been cancelled.',
            type: 'info'
          });
          loadRequests();
        }
      } catch (err) {
        addToast({
          title: 'Cancellation Error',
          message: err.message || 'Could not cancel guidance request.',
          type: 'error'
        });
      }
    },
    [addToast, loadRequests]
  );

  /**
   * Complete guidance request
   */
  const completeRequest = useCallback(
    async (id) => {
      try {
        const res = await guidanceApi.completeGuidanceRequest(id);
        if (res.success) {
          setSentRequests((prev) =>
            prev.map((req) =>
              req.id === id || req._id === id ? { ...req, status: 'Completed' } : req
            )
          );
          setReceivedRequests((prev) =>
            prev.map((req) =>
              req.id === id || req._id === id ? { ...req, status: 'Completed' } : req
            )
          );
          addToast({
            title: 'Guidance marked as completed.',
            message: 'The guidance interaction has been marked as complete.',
            type: 'success'
          });
          loadRequests();
        }
      } catch (err) {
        addToast({
          title: 'Error',
          message: err.message || 'Could not complete guidance request.',
          type: 'error'
        });
      }
    },
    [addToast, loadRequests]
  );

  const stats = useMemo(() => {
    return {
      pendingSent: sentRequests.filter((r) => r.status === 'Pending').length,
      acceptedSent: sentRequests.filter((r) => r.status === 'Accepted').length,
      rejectedSent: sentRequests.filter((r) => r.status === 'Rejected').length,
      pendingReceived: receivedRequests.filter((r) => r.status === 'Pending').length,
      acceptedReceived: receivedRequests.filter((r) => r.status === 'Accepted').length,
      rejectedReceived: receivedRequests.filter((r) => r.status === 'Rejected').length,
      totalPending:
        sentRequests.filter((r) => r.status === 'Pending').length +
        receivedRequests.filter((r) => r.status === 'Pending').length,
      totalAccepted:
        sentRequests.filter((r) => r.status === 'Accepted').length +
        receivedRequests.filter((r) => r.status === 'Accepted').length
    };
  }, [sentRequests, receivedRequests]);

  return (
    <GuidanceContext.Provider
      value={{
        sentRequests,
        receivedRequests,
        isLoading,
        sendGuidanceRequest,
        acceptReceivedRequest,
        rejectReceivedRequest,
        cancelSentRequest,
        completeRequest,
        refreshRequests: loadRequests,
        stats
      }}
    >
      {children}
    </GuidanceContext.Provider>
  );
}

export function useGuidance() {
  const context = useContext(GuidanceContext);
  if (!context) {
    throw new Error('useGuidance must be used within a GuidanceProvider');
  }
  return context;
}
