// Ponte DS Connect (São Paulo): repassa só consultas de leitura (GET /api/...) para a API da Data System.
// Não guarda chave: a chave X-Api-Key vem do app em cada chamada.
const http = require('http');
const BASE = 'https://ep-api-ash2aqb7eva6b0br.z01.azurefd.net';
http.createServer(async (req, res) => {
  const fim = (st, obj, ct) => { res.writeHead(st, { 'content-type': ct || 'application/json; charset=utf-8' }); res.end(typeof obj === 'string' ? obj : JSON.stringify(obj)); };
  try {
    if (req.url === '/ip') { const r = await fetch('https://ipinfo.io/json'); return fim(200, await r.text()); }
    if (req.method !== 'GET' || !/^\/api\/v\d+\//.test(req.url)) return fim(404, { error: 'rota_nao_permitida' });
    const k = req.headers['x-api-key']; if (!k) return fim(401, { error: 'api_key_required' });
    const h = { 'X-Api-Key': k, Accept: 'application/json' }; if (req.headers['x-store-code']) h['X-Store-Code'] = req.headers['x-store-code'];
    const r = await fetch(BASE + req.url, { headers: h });
    return fim(r.status, await r.text(), r.headers.get('content-type'));
  } catch (e) { return fim(502, { error: 'ponte', msg: String(e) }); }
}).listen(process.env.PORT || 8080);
