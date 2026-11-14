const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const serviceDescriptions = {
  "Brand Identity": "Identitas visual untuk brand Kopi Pagi, mencakup logo, palet warna, tipografi, dan arahan visual agar brand tampil konsisten dan mudah diingat.",
  "Desain Sosial Media": "Sistem konten sosial media untuk campaign Sunday Market dengan gaya visual cerah, template konsisten, dan materi promosi yang mudah dikenali.",
  "UI/UX & Web Design": "Konsep pengalaman digital untuk Forma Studio, dengan tata letak yang terarah, tipografi tegas, dan antarmuka yang fokus pada kemudahan pengguna."
};

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2800);
}

// Mobile navigation
const menuToggle = $("#menuToggle");
const mainNav = $("#mainNav");
menuToggle.addEventListener("click", () => {
  const open = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.textContent = open ? "×" : "☰";
});
$$(".nav-link").forEach(link => link.addEventListener("click", () => {
  mainNav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.textContent = "☰";
}));
const sections = $$("main section[id]");
if ("IntersectionObserver" in window) {
  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        $$(".nav-link").forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
      }
    });
  }, { rootMargin: "-35% 0px -55% 0px" });
  sections.forEach(section => navObserver.observe(section));
}

// Service shortcuts preselect the contact form
$$(".service-choose").forEach(button => button.addEventListener("click", () => {
  const service = button.dataset.service;
  $("#contactService").value = service;
  $("#kontak").scrollIntoView({ behavior: "smooth" });
  showToast(`${service} dipilih. Lengkapi brief proyekmu.`);
}));

// TOPSIS decision support
// Criteria: price = cost; quality, speed and revisions = benefit.
// Scores below are demo assessment data on a 1–5 scale except price, which is in thousands of rupiah.
const alternatives = [
  { name: "Starter Visual", price: 150, scores: { harga: 5, kualitas: 3, kecepatan: 5, revisi: 2 }, description: "Paket ekonomis untuk kebutuhan visual sederhana." },
  { name: "Brand Essential", price: 350, scores: { harga: 4, kualitas: 4, kecepatan: 4, revisi: 3 }, description: "Paket seimbang untuk membangun identitas brand." },
  { name: "Creative Plus", price: 650, scores: { harga: 3, kualitas: 5, kecepatan: 3, revisi: 4 }, description: "Paket untuk kebutuhan desain yang lebih menyeluruh." },
  { name: "Digital Pro", price: 950, scores: { harga: 2, kualitas: 5, kecepatan: 4, revisi: 5 }, description: "Paket premium dengan dukungan desain dan revisi lebih banyak." },
  { name: "Custom Studio", price: 1250, scores: { harga: 1, kualitas: 5, kecepatan: 2, revisi: 5 }, description: "Paket fleksibel untuk proyek kompleks dan kebutuhan khusus." }
];

function getWeights() {
  const weights = {};
  $$("[data-weight]").forEach(input => {
    weights[input.dataset.weight] = Number(input.value);
  });
  return weights;
}
$$("[data-weight]").forEach(input => {
  input.addEventListener("input", () => {
    input.nextElementSibling.value = input.value;
  });
});

function runTopsis() {
  const criteria = ["harga", "kualitas", "kecepatan", "revisi"];
  const rawWeights = getWeights();
  const weightTotal = criteria.reduce((sum, key) => sum + rawWeights[key], 0);
  const weights = Object.fromEntries(criteria.map(key => [key, rawWeights[key] / weightTotal]));

  // Vector normalization: r_ij = x_ij / sqrt(sum(x_ij^2))
  const matrix = alternatives.map(item => ({
    ...item,
    values: { harga: item.price, kualitas: item.scores.kualitas, kecepatan: item.scores.kecepatan, revisi: item.scores.revisi }
  }));
  const denominators = Object.fromEntries(criteria.map(key => [
    key, Math.sqrt(matrix.reduce((sum, item) => sum + item.values[key] ** 2, 0))
  ]));
  const weighted = matrix.map(item => ({
    ...item,
    normalized: Object.fromEntries(criteria.map(key => [key, (item.values[key] / denominators[key]) * weights[key]]))
  }));

  // Ideal positive/negative: price is cost; remaining criteria are benefits.
  const idealPositive = {}, idealNegative = {};
  criteria.forEach(key => {
    const values = weighted.map(item => item.normalized[key]);
    if (key === "harga") {
      idealPositive[key] = Math.min(...values);
      idealNegative[key] = Math.max(...values);
    } else {
      idealPositive[key] = Math.max(...values);
      idealNegative[key] = Math.min(...values);
    }
  });

  const results = weighted.map(item => {
    const dPositive = Math.sqrt(criteria.reduce((sum, key) => sum + (item.normalized[key] - idealPositive[key]) ** 2, 0));
    const dNegative = Math.sqrt(criteria.reduce((sum, key) => sum + (item.normalized[key] - idealNegative[key]) ** 2, 0));
    const preference = (dPositive + dNegative) === 0 ? 0 : dNegative / (dPositive + dNegative);
    return { ...item, dPositive, dNegative, preference };
  }).sort((a, b) => b.preference - a.preference);

  renderResults(results, weights);
}

function formatPrice(price) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(price * 1000);
}
function renderResults(results, weights) {
  const winner = results[0];
  const area = $("#resultsArea");
  area.innerHTML = `
    <div class="result-summary">
      <div><small>REKOMENDASI UTAMA</small><strong>${winner.name}</strong></div>
      <div class="result-score">${winner.preference.toFixed(3)}</div>
    </div>
    <div class="ranking-list">
      ${results.map((item, index) => `
        <div class="ranking-item">
          <span class="rank-number">#${index + 1}</span>
          <div><div class="rank-name">${item.name}</div><div class="rank-price">${formatPrice(item.price)}</div>
          <div class="rank-bar"><span style="width:${Math.max(3, item.preference * 100)}%"></span></div></div>
          <span class="rank-value">${item.preference.toFixed(3)}</span>
        </div>`).join("")}
    </div>
    <p class="result-footnote">Peringkat dihitung dari bobot saat ini: harga ${(weights.harga * 100).toFixed(0)}%, kualitas ${(weights.kualitas * 100).toFixed(0)}%, kecepatan ${(weights.kecepatan * 100).toFixed(0)}%, revisi ${(weights.revisi * 100).toFixed(0)}%. Skor alternatif adalah data simulasi untuk demonstrasi akademik, bukan penawaran harga final.</p>
  `;
  area.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
$("#calculateBtn").addEventListener("click", runTopsis);

// Portfolio search + category filter
function filterPortfolio() {
  const query = $("#portfolioSearch").value.trim().toLowerCase();
  const category = $("#portfolioFilter").value;
  let visible = 0;
  $$(".portfolio-card").forEach(card => {
    const matchesQuery = card.dataset.title.toLowerCase().includes(query) || card.dataset.category.toLowerCase().includes(query);
    const matchesCategory = category === "Semua" || card.dataset.category === category;
    const show = matchesQuery && matchesCategory;
    card.hidden = !show;
    if (show) visible++;
  });
  $("#portfolioEmpty").hidden = visible > 0;
}
$("#portfolioSearch").addEventListener("input", filterPortfolio);
$("#portfolioFilter").addEventListener("change", filterPortfolio);

// Project detail modal
const dialog = $("#projectDialog");
$$(".portfolio-open").forEach(button => button.addEventListener("click", () => {
  const name = button.dataset.project;
  $("#dialogTitle").textContent = name;
  $("#dialogDescription").textContent = serviceDescriptions[name === "Kopi Pagi" ? "Brand Identity" : name === "Sunday Market" ? "Desain Sosial Media" : "UI/UX & Web Design"];
  dialog.showModal();
}));
$("#dialogClose").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
});
$("#dialogContact").addEventListener("click", () => {
  dialog.close();
  $("#kontak").scrollIntoView({ behavior: "smooth" });
});

// Contact form: no backend is configured; generate a mailto draft rather than pretending data was sent.
$("#contactForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const subject = encodeURIComponent(`Brief proyek DesainKu — ${data.get("nama")}`);
  const body = encodeURIComponent(
    `Nama: ${data.get("nama")}\nEmail: ${data.get("email")}\nLayanan: ${data.get("layanan")}\n\nBrief proyek:\n${data.get("pesan")}`
  );
  $("#formFeedback").textContent = "Brief sudah disiapkan. Jika aplikasi email tidak terbuka, salin informasi dari formulir dan hubungi studio secara manual.";
  showToast("Membuka aplikasi email untuk menyiapkan brief.");
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
});

// Initial calculation is intentionally user-triggered so users can change weights first.
