// import dns from 'dns';

// dns.resolveSrv('_mongodb._tcp.cluster.vajjk.mongodb.net', (err, addresses) => {
//   if (err) {
//     console.error('Erreur DNS:', err);
//   } else {
//     console.log('Résolution DNS SRV réussie :', addresses);
//   }
// });

dns.resolve('google.com', (err, addresses) => {
  if (err) console.error('Erreur DNS Google:', err);
  else console.log('Google résolu:', addresses);
});
