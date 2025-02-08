import { LoadingButton } from '@mui/lab';
import SyncIcon from '@mui/icons-material/Sync';
import { useState, useCallback, useEffect } from 'react';
import { FormControlLabel, Switch } from '@mui/material';
import { usePolling } from '../hooks/usePolling';

const MemberFeed: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  
  const loadPosts = useCallback(async () => {
    try {
      setIsRefreshing(true);
      // ... existing code for fetching posts ...
    } catch (error) {
      console.error('Error loading posts:', error);
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const { startPolling, stopPolling } = usePolling(loadPosts, {
    interval: 30000, // Poll every 30 seconds
    enabled: autoRefreshEnabled,
    backoffFactor: 2,
    maxBackoff: 300000, // Max 5 minutes between retries
  });

  useEffect(() => {
    if (autoRefreshEnabled) {
      startPolling();
    } else {
      stopPolling();
    }
  }, [autoRefreshEnabled, startPolling, stopPolling]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <LoadingButton
          loading={isRefreshing}
          onClick={loadPosts}
          startIcon={<SyncIcon />}
          loadingPosition="start"
          variant="contained"
        >
          Refresh
        </LoadingButton>
        <FormControlLabel
          control={
            <Switch
              checked={autoRefreshEnabled}
              onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
            />
          }
          label="Auto-refresh"
        />
      </div>
      {/* ... existing feed content ... */}
    </div>
  );
};

export default MemberFeed; 