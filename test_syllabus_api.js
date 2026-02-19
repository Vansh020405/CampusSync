
const fetch = require('node-fetch');

async function test() {
    const payload = {
        subjectName: "Test Subject " + Date.now(),
        subjectCode: "TS101",
        department: "CSE",
        topics: [
            { title: "Topic 1", examType: "ST1" },
            { title: "Topic 2", examType: "ST1" }
        ]
    };

    try {
        const res = await fetch('http://localhost:3000/api/admin/syllabus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // We might need a session cookie here, but let's see if we get 401 or 500
            },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Data:", data);
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
