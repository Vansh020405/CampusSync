async function testApi() {
    const res = await fetch('http://localhost:3000/api/faculty/list')
    const data = await res.json()
    console.log("Faculty List API:", JSON.stringify(data, null, 2))
}
testApi()
