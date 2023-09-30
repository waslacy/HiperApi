function comunicar(id, op) {
    fetch(`http://194.163.45.85:3000/${op}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `id=${id}`
    }).then((response) => {
        return response.text();
    }).then((data) => {
        alert(data); // this will be a string
    });
}
