import http from 'http'
import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'node:url'
import { spawn } from 'node:child_process'

const MIME = {
    '.html': 'text/html; charset-utf-8',
    '.css': 'text/css; charset-utf-8',
    '.js': 'text/javascript; charset-utf-8',
    '.json': 'application/json; charset-utf-8',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
}

const _dirname = path.dirname(fileURLToPath(import.meta.url))
const PORTA = process.argv[2] || 3000
const server = http.createServer((req,res) => {
    if(req.method === 'POST' && req.url === '/run') {
        const proc = spawn('node', ['checker.js'])
        let saida = ''
        proc.stdout.on('data', chuck => { saida += chuck.toString() })
        proc.stderr.on('data', chuck => { saida += chuck.toString() })
        proc.on('close', code => {
            if(code === 0) {
                res.writeHead(200, {'Content-Type': 'application/json'})
                res.end(JSON.stringify({ ok: true, log: saida}))
            } else {
                res.writeHead(500, {'Content-Type': 'application/json'})
                res.end(JSON.stringify({ok: false, log: saida}))
            }
        })
        return
    }
    if(req.url === '/resultados') {
        const dados = fs.readFileSync(path.join(_dirname, 'resultados.json'), 'utf-8')
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        })
        res.end(dados)
        return
    }
    
    const urlPath = req.url === '/' ? '/index.html' : req.url
    const arquivo = path.join(_dirname, 'public', urlPath)
    const ext = path.extname(arquivo)
    const mime = MIME[ext] || 'text/plain'
    
    try {
        const conteudo = fs.readFileSync(arquivo)
        res.writeHead(200, {'Content-Type': mime})
        res.end(conteudo)
    } catch {
        res.writeHead(404, {'Content-Type': 'text/html'})
        res.end('Arquivo não encontrado: ' + urlPath)
    }
})

server.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`)
    console.log('Dados JSON em http://localhost:' + PORTA + '/resultados')
})