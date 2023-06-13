const eventsSeeder = require('./events.seeder');
const { mongoConnect } = require('./services/mongo')

await mongoConnect();

const insertSeeds = async () => {
    await eventsSeeder();
    process.stdout.write('Seeds inserted');
    process.exit(0);
}

module.exports = insertSeeds;