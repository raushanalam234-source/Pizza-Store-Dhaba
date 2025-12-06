function submitForm() {
    let name = document.getElementById("name").value;
    let msg = document.getElementById("msg").value;

    if (name === "" || msg === "") {
        alert("कृपया सभी जानकारी भरें!");
    } else {
        alert("धन्यवाद! आपका संदेश भेज दिया गया है।");
    }
}


function animateCounter(id, target) {
    let counter = document.getElementById(id);
    let current = 0;

    let speed = target / 100; // speed control

    let interval = setInterval(() => {
        current += speed;
        counter.innerText = Math.floor(current);

        if (current >= target) {
            counter.innerText = target;
            clearInterval(interval);
        }
    }, 20);
}

// Call counters
animateCounter("totalApps", 300);
animateCounter("rejectApps", 25);
animateCounter("successApps", 220);
animateCounter("pendingApps", 10);


let balance = 1000; // starting balance

document.getElementById("addBalanceBtn").addEventListener("click", function () {
    balance += 10;  // har click me 10 rupaye add hoga (change kar sakte ho)
    document.getElementById("balanceAmount").innerText = "₹ " + balance;
});


