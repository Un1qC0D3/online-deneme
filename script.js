const oturumlar = {
  sozel: {
    pdf: "pdf/sozel.pdf",
    title: "Sözel Oturumu",
    sure: 75 * 60,
    questions: [
      { title: "Türkçe", count: 20 },
      { title: "T.C. İnkılap Tarihi ve Atatürkçülük", count: 10 },
      { title: "Din Kültürü ve Ahlak Bilgisi", count: 10 },
      { title: "İngilizce", count: 10 },
    ],
  },
  sayisal: {
    pdf: "pdf/sayisal.pdf",
    title: "Sayısal Oturumu",
    sure: 80 * 60,
    questions: [
      { title: "Matematik", count: 20 },
      { title: "Fen Bilimleri", count: 20 },
    ],
  },
};

let activeOturum = null;
let globalIndex = 1;
let timerInterval = null;

function setCookie(name, value, days = 1) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

function startOturum(name) {
  if (name === "sozel") {
    const input = document.getElementById("student-name");
    const studentName = input.value.trim();
    if (!studentName) {
      alert("Lütfen adınızı girin.");
      return;
    }
    setCookie("studentName", studentName);
  }

  activeOturum = name;
  globalIndex = name === "sozel" ? 1 : 51;

  // ekranları kapat
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("oturum-container").style.display = "none";
  document.getElementById("loading-screen").style.display = "flex";

  // cevap kutularını temizle
  const containerId = name === "sozel" ? "answers-sozel" : "answers-sayisal";
  document.getElementById(containerId).innerHTML = "";

  drawAnswers(oturumlar[name].questions);

  // PDF iframe olarak yüklenir
  loadPDF(oturumlar[name].pdf, () => {
    document.getElementById("loading-screen").style.display = "none";
    document.getElementById("oturum-container").style.display = "block";
    document.getElementById("oturum-title").textContent = oturumlar[name].title;

    document.getElementById("answers-sozel").style.display =
      name === "sozel" ? "block" : "none";
    document.getElementById("answers-sayisal").style.display =
      name === "sayisal" ? "block" : "none";

    startTimer(oturumlar[name].sure);
  });
}

function drawAnswers(groups) {
  const container = document.getElementById(
    activeOturum === "sozel" ? "answers-sozel" : "answers-sayisal"
  );

  if (container.childElementCount > 0) return;
  container.innerHTML = "";

  groups.forEach((group) => {
    const h = document.createElement("h6");
    h.textContent = group.title;
    h.className = "mt-4 mb-2 text-primary border-bottom pb-1";
    container.appendChild(h);

    for (let i = 1; i <= group.count; i++) {
      const wrapper = document.createElement("div");
      wrapper.className = "answer-row";

      const label = document.createElement("strong");
      label.textContent = `${i}.`;
      wrapper.appendChild(label);

      ["A", "B", "C", "D"].forEach((letter) => {
        const id = `q${globalIndex}_${letter}`;
        const div = document.createElement("label");
        div.className = "answer-option";

        const input = document.createElement("input");
        input.type = "radio";
        input.name = `q${globalIndex}`;
        input.id = id;
        input.value = letter;

        // Tıklanınca şık seçimi / iptali
        div.addEventListener("click", (e) => {
          const wasChecked = input.checked;
          const all = wrapper.querySelectorAll(".answer-option");
          all.forEach((opt) => {
            opt.classList.remove("selected");
            const inp = opt.querySelector("input");
            if (inp) inp.checked = false;
          });

          if (!wasChecked) {
            input.checked = true;
            div.classList.add("selected");
          }

          e.preventDefault();
        });

        div.appendChild(input);
        div.append(letter);
        wrapper.appendChild(div);
      });

      container.appendChild(wrapper);
      globalIndex++;
    }
  });
}

function startTimer(duration) {
  let timer = duration;
  const display = document.getElementById("timer");

  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    const m = String(Math.floor(timer / 60)).padStart(2, "0");
    const s = String(timer % 60).padStart(2, "0");
    display.textContent = `${m}:${s}`;
    if (--timer < 0) {
      clearInterval(timerInterval);
      endOturum();
    }
  }, 1000);
}

function endOturum() {
  if (timerInterval) clearInterval(timerInterval);

  alert(activeOturum.toUpperCase() + " oturumu sona erdi.");

  if (activeOturum === "sozel") {
    document.getElementById("oturum-container").style.display = "none";
    document.getElementById("start-screen").innerHTML =
      '<button class="btn btn-primary btn-lg" onclick="startOturum(\'sayisal\')">Sayısal Oturumuna Başla</button>';
    document.getElementById("start-screen").style.display = "block";
  } else {
    printAnswers();
    document.getElementById("oturum-container").style.display = "none";
    document.getElementById("start-screen").innerHTML =
      "<h4>Tebrikler, sınav tamamlandı.</h4>";
    document.getElementById("start-screen").style.display = "block";
  }
}

function printAnswers() {
  let output = "";
  let index = 1;
  const groups = [...oturumlar.sozel.questions, ...oturumlar.sayisal.questions];
  groups.forEach((group) => {
    output += `\n${group.title}\n`;
    let line = "";
    for (let i = 0; i < group.count; i++) {
      const selected = document.querySelector(
        `input[name="q${index}"]:checked`
      );
      line += selected ? selected.value : " ";
      index++;
    }
    output += line + "\n";
  });

  const name = getCookie("studentName") || "ogrenci";
  const fileName = `${name.replaceAll(" ", "_")}-cevaplar.txt`;
  downloadTextFile(fileName, output);

  const safeName = name.replaceAll(" ", "_");
  document.getElementById("start-screen").innerHTML += `
    <button class="btn btn-outline-success mt-3" onclick="downloadTextFile('${safeName}-cevaplar.txt', \`${output.replace(
    /`/g,
    "\\`"
  )}\`)">
      Cevapları İndir (.txt)
    </button>
  `;
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

function loadPDF(url, callback) {
  const wrapper = document.getElementById("pdf-wrapper");
  wrapper.innerHTML = "";

  const iframe = document.createElement("iframe");
  iframe.src = url;
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";

  iframe.onload = () => {
    if (typeof callback === "function") callback();
  };

  wrapper.appendChild(iframe);
}

window.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("student-name");
  const button = document.getElementById("start-button");
  const text = document.getElementById("info-text");

  input.addEventListener("input", () => {
    if (input.value.trim() !== "") {
      button.style.display = "inline-block";
      text.style.display = "inline-block";
    } else {
      button.style.display = "none";
      text.style.display = "none";
    }
  });
});
