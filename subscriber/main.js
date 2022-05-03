import dgram from 'dgram'
import axios from 'axios'

const token = process.env.TOKEN;
const record = process.env.RECORD;
const port = process.env.PORT;

const server = dgram.createSocket('udp4')
const api = `https://api.digitalocean.com/v2/domains/erwor.me/records/${record}`

let lastIp;

server.on('error', (err) => {
	console.error("Error starting server: " + err)
})

server.on('message', (buf, rinfo) => {
    const ip = rinfo.address;
	const json = processMessage(buf)
	if (json == null) {
		// There was loss, corruption or unwanted traffic
		console.error(
			"Invalid message: " + buf.toString() + '\t' + "IP: " + ip
		)
		return;
	}

	if (lastIp == ip) { return; }

    console.log(`${new Date().toISOString()}\tReceived new IP: ${ip}`)

    // Assign ip to A-record
	replaceIp(ip);

	lastIp = ip;
})

server.on('listening', () => {
	const address = server.address()
	console.log(`server listening ${address.address}:${address.port}`)
})

if (!port || !token || !record) {
    console.error(`No port, token or record specified`);
    process.exit(-1);
}
server.bind(port)


//**********************************************************
async function replaceIp(ip) {
	try {
		await axios({
			method: 'patch',
			url: api,
			data: {
				type: 'A',
				data: ip,
			},
			headers: { 'Authorization': `Bearer ${token}` },
		})
	} catch (e) {
		console.error(e)
	}
}

function processMessage(buf) {
	let json;
	if (buf.length > 14) { return null; }	
	try {
		json = JSON.parse(buf.toString('ascii'))	
	} catch (e) {
		return null;
	}
	if (!json?.ping) { return null; }
	return json
}