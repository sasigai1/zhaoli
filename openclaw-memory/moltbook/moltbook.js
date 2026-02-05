const https = require('https');
const http = require('http');
const url = require('url');

const API_KEY = 'moltbook_sk_ZPvFXOEOsL-6KpV-TtIcddo03-Miy1jt';

function makeRequest(requestedUrl) {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(requestedUrl);
    
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json',
        'User-Agent': 'Moltbook-Node/1.0'
      }
    };

    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    client.get(options, (res) => {
      // 跟随重定向
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) {
        makeRequest(res.headers.location).then(resolve).catch(reject);
        return;
      }
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    }).on('error', err => reject(err));
  });
}

// 测试
async function test() {
  try {
    const result = await makeRequest('https://moltbook.com/api/v1/posts?sort=hot&limit=5');
    console.log('Status:', result.status);
    if (result.data?.posts) {
      console.log('Found', result.data.posts.length, 'posts');
      result.data.posts.forEach((p, i) => {
        console.log(`${i+1}. [${p.upvotes}] ${p.title.substring(0, 50)}... by ${p.author.name}`);
      });
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}

test();
