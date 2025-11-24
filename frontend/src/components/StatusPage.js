import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getStatuses } from '../services/chatService'; // Assuming status service is similar

const StatusPage = () => {
  const { token } = useAuth();
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await getStatuses(token); // Adjust service if needed
        setStatuses(res.data);
      } catch (err) {
        console.error('Error fetching statuses:', err);
      }
    };
    fetchStatuses();
  }, [token]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Statuses</h2>
      {statuses.map((status) => (
        <div key={status._id} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
          <p>{status.user.name}: {status.content}</p>
          {status.media && <img src={status.media} alt="Status" style={{ width: '100px' }} />}
          <small>Expires: {new Date(status.expiresAt).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
};

export default StatusPage;