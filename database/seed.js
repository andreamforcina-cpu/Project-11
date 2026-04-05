const { db, User, Task } = require('./setup');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
    try {
        await db.sync({ force: true });

        const password = await bcrypt.hash('password123', 10);

        const users = await User.bulkCreate([
            { name: 'John', email: 'john@test.com', password },
            { name: 'Jane', email: 'jane@test.com', password }
        ]);

        await Task.bulkCreate([
            { title: 'Task 1', userId: users[0].id },
            { title: 'Task 2', userId: users[1].id }
        ]);

        console.log('Seeded successfully');

    } catch (err) {
        console.error(err);
    } finally {
        await db.close();
    }
}

seedDatabase();