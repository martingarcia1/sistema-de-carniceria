import * as signalR from '@microsoft/signalr';

let connection = null;

export const getConnection = () => {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5000/hubs/balanza')
      .withAutomaticReconnect()
      .build();
  }
  return connection;
};

export const iniciarConexion = async () => {
  const conn = getConnection();
  if (conn.state === signalR.HubConnectionState.Disconnected) {
    await conn.start();
  }
  return conn;
};

export const detenerConexion = async () => {
  if (connection?.state === signalR.HubConnectionState.Connected) {
    await connection.stop();
  }
};
