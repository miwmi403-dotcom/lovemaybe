window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) { window.setTimeout(callback, 1000 / 60); };

// --- SISTEM PEMUTAR MUSIK ---
const musicPrompt = document.getElementById('music-prompt');
const bgMusic = document.getElementById('bg-music');

function startExperience() {
  bgMusic.play().catch(err => console.log("Autoplay diblokir:", err));
  musicPrompt.style.opacity = '0';
  setTimeout(() => musicPrompt.remove(), 500);
  document.removeEventListener('click', startExperience);
}
document.addEventListener('click', startExperience);


// --- ANIMASI HATI & SEMBURAN LOVE ---
var loaded = false;
var init = function () {
  if (loaded) return;
  loaded = true;
  
  var canvas = document.getElementById("heart");
  var ctx = canvas.getContext("2d");
  
  var width = canvas.width = window.innerWidth;
  var height = canvas.height = window.innerHeight;
  var rand = Math.random;

  var sizeFactor = Math.min(width, height) / 750;

  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.fillRect(0, 0, width, height);

  var heartPosition = function (rad) {
    return [
      Math.pow(Math.sin(rad), 3),
      -(15 * Math.cos(rad) - 5 * Math.cos(2 * rad) - 2 * Math.cos(3 * rad) - Math.cos(4 * rad)),
    ];
  };

  var scaleAndTranslate = function (pos, sx, sy, dx, dy) {
    return [dx + pos * sx, dy + pos * sy];
  };

  var pointsOrigin = [];
  var dr = 0.1;
  
  var setupPoints = function() {
    pointsOrigin = [];
    for (var i = 0; i < Math.PI * 2; i += dr)
      pointsOrigin.push(scaleAndTranslate(heartPosition(i), 230 * sizeFactor, 14 * sizeFactor, 0, 0)); 
    for (var i = 0; i < Math.PI * 2; i += dr)
      pointsOrigin.push(scaleAndTranslate(heartPosition(i), 180 * sizeFactor, 11 * sizeFactor, 0, 0)); 
    for (var i = 0; i < Math.PI * 2; i += dr)
      pointsOrigin.push(scaleAndTranslate(heartPosition(i), 130 * sizeFactor, 8 * sizeFactor, 0, 0)); 
  };
  
  setupPoints();

  var heartPointsCount = pointsOrigin.length;
  var targetPoints = [];

  var pulse = function (kx, ky) {
    for (var i = 0; i < pointsOrigin.length; i++) {
      targetPoints[i] = [
        kx * pointsOrigin[i] + width / 2,
        ky * pointsOrigin[i] + height / 2.2,
      ];
    }
  };

  // Inisialisasi Partikel Hati Utama
  var e = [];
  for (var i = 0; i < heartPointsCount; i++) {
    var x = rand() * width;
    var y = rand() * height;
    e[i] = {
      vx: 0,
      vy: 0,
      R: 2,
      speed: rand() + 5,
      q: ~~(rand() * heartPointsCount),
      D: 2 * (i % 2) - 1,
      force: 0.2 * rand() + 0.7,
      f: "rgba(255, 105, 180, 0.7)", 
      trace: Array.from({ length: 30 }, () => ({ x, y })),
    };
  }

  // Semburan Love Tengah (Flying Hearts)
  var flyingHearts = [];
  var maxFlyingHearts = 25; 

  function createFlyingHeart() {
    return {
      x: width / 2 + (rand() * 40 - 20), 
      y: height + 20,                   
      size: rand() * 8 + 6,              
      speedY: rand() * 2 + 2,            
      speedX: Math.sin(rand() * Math.PI * 2) * 0.5, 
      opacity: rand() * 0.4 + 0.6
    };
  }

  function drawMiniHeart(x, y, size, opacity) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-size / 2, -size / 2, -size, size / 3, 0, size);
    ctx.bezierCurveTo(size, size / 3, size / 2, -size / 2, 0, 0);
    ctx.fillStyle = "rgba(255, 105, 180, " + opacity + ")";
    ctx.fill();
    ctx.restore();
  }

  var config = { traceK: 0.4, timeDelta: 0.6 };
  var time = 0;

  // LOOP UTAMA ANIMASI
  var loop = function () {
    var n = -Math.cos(time);
    pulse((1 + n) * 0.5, (1 + n) * 0.5);
    time += (Math.sin(time) < 0 ? 9 : n > 0.8 ? 0.2 : 1) * config.timeDelta;

    ctx.fillStyle = "rgba(0,0,0,.1)"; 
    ctx.fillRect(0, 0, width, height);

    // Update & Gambar Semburan Love Tengah
    if (flyingHearts.length < maxFlyingHearts && rand() < 0.1) {
      flyingHearts.push(createFlyingHeart());
    }

    for (var i = flyingHearts.length - 1; i >= 0; i--) {
      var fh = flyingHearts[i];
      fh.y -= fh.speedY;
      fh.x += fh.speedX;
      fh.opacity -= 0.003; 

      drawMiniHeart(fh.x, fh.y, fh.size, fh.opacity);

      if (fh.y < -20 || fh.opacity <= 0) {
        flyingHearts.splice(i, 1);
      }
    }

    // Update & Gambar Partikel Hati Besar
    for (var i = e.length; i--; ) {
      var u = e[i];
      var q = targetPoints[u.q];
      var dx = u.trace.x - q;
      var dy = u.trace.y - q;
      var length = Math.sqrt(dx * dx + dy * dy);

      if (length < 10) {
        if (rand() > 0.95) {
          u.q = ~~(rand() * heartPointsCount);
        } else {
          if (rand() > 0.99) u.D *= -1;
          u.q = (u.q + u.D) % heartPointsCount;
          if (u.q < 0) u.q += heartPointsCount;
        }
      }

      u.vx += (-dx / length) * u.speed;
      u.vy += (-dy / length) * u.speed;
      u.trace.x += u.vx;
      u.trace.y += u.vy;
      u.vx *= u.force;
      u.vy *= u.force;

      for (var k = 0; k < u.trace.length - 1; k++) {
        var T = u.trace[k];
        var N = u.trace[k + 1];
        N.x -= config.traceK * (N.x - T.x);
        N.y -= config.traceK * (N.y - T.y);
      }

      ctx.fillStyle = u.f;
      u.trace.forEach((t) => ctx.fillRect(t.x, t.y, 1, 1));
    }

    window.requestAnimationFrame(loop, canvas);
  };

  window.addEventListener("resize", function () {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    sizeFactor = Math.min(width, height) / 750;
    setupPoints();
  });

  loop();
};

var s = document.readyState;
if (s === "complete" || s === "loaded" || s === "interactive") init();
else document.addEventListener("DOMContentLoaded", init);