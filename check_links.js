
import dbConnect from './src/lib/mongoose.js';
import Program from './src/collections/Program.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkLinks() {
    await dbConnect();
    const programs = await Program.find({});
    console.log(JSON.stringify(programs.map(p => ({ id: p.id, link: p.link })), null, 2));
    process.exit(0);
}

checkLinks();
