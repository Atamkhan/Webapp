const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const port = 3000;


const pollData = {
    "pollId": 1,
    "pollName": "Premier League Winner",
    "question": "Who will win the Premier League?",
    "options": [
        {
            "optionId": 1,
            "optionText": "Manchester City"
        },
        {
            "optionId": 2,
            "optionText": "Arsenal"
        },
        {
            "optionId": 3,
            "optionText": "Liverpool"
        }
    ]
};


const votes = {};

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));



app.get('/polls/:pollId', (req, res) => {
    res.json(pollData);
});


app.post('/votes', (req, res) => {
    const { pollId, optionId } = req.body;

    console.log('Received vote - Poll ID:', pollId, 'Option ID:', optionId, 'Request Body:', req.body);

    if (!pollData || pollData.pollId !== pollId) {
        return res.status(404).json({ error: 'Poll not found' });
    }

    const parsedOptionId = parseInt(optionId);


    const selectedOption = pollData.options.find(option => option.optionId === parsedOptionId);
    if (!selectedOption) {
        return res.status(400).json({ error: 'Invalid option' });
    }

    votes[pollId] = votes[pollId] || {};
    votes[pollId][parsedOptionId] = (votes[pollId][parsedOptionId] || 0) + 1;

    res.json({ success: true });
});

app.get('/votes/:pollId', (req, res) => {
    const pollId = parseInt(req.params.pollId);


    if (!pollData || pollData.pollId !== pollId) {
        return res.status(404).json({ error: 'Poll not found' });
    }

    const pollVotes = votes[pollId] || {};


    const totalVotes = Object.values(pollVotes).reduce((acc, count) => acc + count, 0);

    const percentages = {};
    pollData.options.forEach(option => {
        const optionId = option.optionId.toString();
        const count = pollVotes[optionId] || 0;
        const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

        console.log(`Option: ${option.optionText}, Count: ${count}, Percentage: ${percentage}%`);

        percentages[optionId] = percentage;
    });

    console.log('Total Votes:', totalVotes);
    console.log('Percentages:', percentages);

    res.json({ totalVotes, percentages });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
