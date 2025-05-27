    const data = [
    { name: "Startseite", url: "/home" },
    { name: "Über uns", url: "/about" },
    { name: "Kontakt", url: "/contact" },
    { name: "Blog", url: "/blog" },
    { name: "Hilfe", url: "/help" }
  ];

  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');

  input.addEventListener('input', () => {
    const query = input.value.toLowerCase();
    results.innerHTML = '';

    if (query.length === 0) return;

    const filtered = data.filter(item => item.name.toLowerCase().includes(query));

    filtered.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item.name;
      li.addEventListener('click', () => {
        window.location.href = item.url;
      });
      results.appendChild(li);
    });
  });
  
  
  let responseAsJson = [];

async function fetchDataJson(){
    let response = await fetch('');
    responseAsJson = await response.json();
    console.log(responseAsJson);

    renderTerms();
}

function renderTerms(){
    let container = document.getElementById("terms");
    let termsArray = responseAsJson.synsets[0].terms;
    for (let i = 0; i < termsArray.length; i++) {
        container.innerHTML += termsArray[i].term + '<br>';
    }
}