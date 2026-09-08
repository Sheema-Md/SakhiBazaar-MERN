import { useEffect, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { SocketContext } from './SocketContext';
import { API_ORIGIN } from '../config/api';

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // If no user is logged in, clean up any existing socket connection
    if (!user || !user.token) {
      if (socket) {
        socket.disconnect();
        setTimeout(() => {
          setSocket(null);
          setConnected(false);
        }, 0);
      }
      return;
    }

    const socketUrl = API_ORIGIN;
    console.log('Initializing Socket.io connection to:', socketUrl);

    // Establish WebSocket connection passing token in handshake
    const newSocket = io(socketUrl, {
      auth: {
        token: user.token,
      },
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      setConnected(true);
      console.log('Socket connected successfully! Socket ID:', newSocket.id);
      // Send manual registration message as backup safety
      if (user._id) {
        newSocket.emit('register_user', user._id);
      }
    });

    newSocket.on('disconnect', (reason) => {
      setConnected(false);
      console.log('Socket disconnected. Reason:', reason);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    // Defer the setSocket update to avoid synchronous state changes in useEffect
    const socketTimer = setTimeout(() => {
      setSocket(newSocket);
    }, 0);

    // Disconnect and clean up listeners on unmount or user change
    return () => {
      console.log('Cleaning up Socket connection...');
      clearTimeout(socketTimer);
      newSocket.disconnect();
      setTimeout(() => {
        setSocket(null);
        setConnected(false);
      }, 0);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
