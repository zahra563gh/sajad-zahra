const MOBILE_TOUCH_STEPS = 3;
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

const textCanvas = document.getElementById("textCanvas");
const textCtx = textCanvas.getContext("2d");

const touchMessage = document.getElementById("touchMessage");
const goldenLight = document.getElementById("goldenLight");
// دست راهنما برای ورود
let touchHand = touchMessage.querySelector(".touch-hand");

if (!touchHand) {
    touchHand = document.createElement("div");
    touchHand.className = "touch-hand";
    touchHand.innerHTML = `<i class="fa-regular fa-hand-pointer"></i>`;
    touchMessage.appendChild(touchHand);
}
const scrollHint = document.getElementById("scrollHint");
const weddingMusic = document.getElementById("weddingMusic");


// =====================================================
// اسم
// =====================================================

const text = "SAJAD & ZAHRA";


// =====================================================
// تنظیمات
// =====================================================

const BACKGROUND_STARS = 500;

const MOUSE_DISTANCE_STEP = 90;

const FORMATION_PARTS = 12;


// وقتی حدود 93 درصد اسم تشکیل شد
// اسکرول آزاد می‌شود
const UNLOCK_PROGRESS = 0.97;


// =====================================================
// متغیرها
// =====================================================

let backgroundStars = [];

let formationStars = [];

let textPoints = [];

let progressTarget = 0;

let progressCurrent = 0;

let musicStarted = false;

let unlocked = false;

let completionStarted = false;
let touchGuideTimer = null;
let lastMoveTime = 0;
let lastMouseX = null;

let lastMouseY = null;

let mouseDistance = 0;


// =====================================================
// تنظیم اندازه Canvas
// =====================================================

function resizeCanvas() {

    const width = window.innerWidth;
    const height = window.innerHeight;

    const dpr = Math.min(
        window.devicePixelRatio || 1,
        2
    );


    // Canvas اصلی

    canvas.width =
        Math.floor(width * dpr);

    canvas.height =
        Math.floor(height * dpr);

    canvas.style.width =
        width + "px";

    canvas.style.height =
        height + "px";


    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );


    // Canvas متن

    textCanvas.width =
        Math.floor(width * dpr);

    textCanvas.height =
        Math.floor(height * dpr);

    textCanvas.style.width =
        width + "px";

    textCanvas.style.height =
        height + "px";


    textCtx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );
}


resizeCanvas();


// =====================================================
// ساخت ستاره‌های پس‌زمینه
// =====================================================

function createBackgroundStars() {

    backgroundStars = [];

    const width =
        window.innerWidth;

    const height =
        window.innerHeight;


    for (
        let i = 0;
        i < BACKGROUND_STARS;
        i++
    ) {

        backgroundStars.push({

            x:
                Math.random() *
                width,

            y:
                Math.random() *
                height,

            size:
                Math.random() * 1.4 +
                0.2,

            opacity:
                Math.random() * 0.7 +
                0.2,

            speed:
                Math.random() * 0.02 +
                0.005,

            phase:
                Math.random() *
                Math.PI *
                2,

            bright:
                Math.random() > 0.96

        });

    }
}


// =====================================================
// ساخت نقاط اسم
// =====================================================

function createTextPoints() {

    const width =
        window.innerWidth;

    const height =
        window.innerHeight;


    textCtx.clearRect(
        0,
        0,
        width,
        height
    );


    // =================================================
    // اندازه اسم
    // =================================================

    let fontSize;


  if (width <= 380) {

    fontSize =
        Math.min(
            width * 0.145,
            68
        );

}

else if (width <= 600) {

    fontSize =
        Math.min(
            width * 0.14,
            74
        );

}
    else {

        fontSize =
            Math.min(
                width * 0.12,
                110
            );

    }


    textCtx.font =
        `700 ${fontSize}px Arial`;


    // مطمئن شویم اسم از صفحه بیرون نزند

    while (
        textCtx.measureText(text).width >
        width * 0.86
    ) {

        fontSize--;

        textCtx.font =
            `700 ${fontSize}px Arial`;

    }


    // =================================================
    // مرکز صفحه
    // =================================================

    const centerX =
        width / 2;

    const centerY =
        height / 2;


    textCtx.textAlign =
        "center";

    textCtx.textBaseline =
        "middle";

    textCtx.fillStyle =
        "white";


    // اسم دقیقاً وسط صفحه

    textCtx.fillText(
        text,
        centerX,
        centerY
    );


    // =================================================
    // گرفتن پیکسل‌های متن
    // =================================================

    const dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );


    const data =
        textCtx.getImageData(
            0,
            0,
            textCanvas.width,
            textCanvas.height
        );


    let points = [];


    // فاصله نقاط

    let gap;


   if (width <= 600) {

    gap = 2.1;

}

else {

    gap = 2.6;

}


    // =================================================
    // پیدا کردن نقاط سفید متن
    // =================================================

    for (
        let y = 0;
        y < height;
        y += gap
    ) {

        for (
            let x = 0;
            x < width;
            x += gap
        ) {

            const pixelX =
                Math.floor(
                    x * dpr
                );

            const pixelY =
                Math.floor(
                    y * dpr
                );


            const index =
                (
                    pixelY *
                    textCanvas.width +
                    pixelX
                ) * 4;


            if (
                data.data[index + 3] >
                150
            ) {

                points.push({

                    x: x,

                    y: y

                });

            }

        }

    }


    return points;
}


// =====================================================
// ساخت ستاره‌های تشکیل‌دهنده اسم
// =====================================================

function createFormationStars() {

    textPoints =
        createTextPoints();


    formationStars = [];


    textPoints.forEach(
        (point, index) => {

            const angle =
                Math.random() *
                Math.PI *
                2;


            const distance =
                250 +
                Math.random() *
                300;


            formationStars.push({

                // موقعیت اولیه

                x:
                    point.x +
                    Math.cos(angle) *
                    distance,

                y:
                    point.y +
                    Math.sin(angle) *
                    distance,


                // مقصد

                targetX:
                    point.x,

                targetY:
                    point.y,


                // اندازه

                size:
                    Math.random() *
                    1.35 +
                    0.45,


                // شفافیت

                opacity:
                    0,


                // فعال بودن

                active:
                    false,


                progress:
                    0,


                delay:
                    index * 5,


                angle:
                    angle,


                swirl:
                    Math.random() *
                    20 +
                    12

            });

        }
    );


    // مرتب‌سازی از چپ به راست

    formationStars.sort(
        (a, b) =>
            a.targetX -
            b.targetX
    );
}


// =====================================================
// ساخت اولیه
// =====================================================

createBackgroundStars();

createFormationStars();


function hideTouchGuide() {
    clearTimeout(touchGuideTimer);

    touchMessage.style.opacity = "0";
    touchMessage.style.transform = "translate(-50%, -50%) scale(0.9)";
}

function showTouchGuideAgain() {
    if (unlocked || progressTarget >= 1) return;

    clearTimeout(touchGuideTimer);

    touchGuideTimer = setTimeout(() => {
        touchMessage.style.opacity = "1";
        touchMessage.style.transform = "translate(-50%, -50%) scale(1)";
    }, 700);
}
// =====================================================
// شروع تجربه
// =====================================================

function startExperience() {

    // =================================================
    // موزیک
    // =================================================

    if (!musicStarted) {

        weddingMusic
            .play()
            .then(() => {

                musicStarted =
                    true;

                console.log(
                    "آهنگ شروع شد"
                );

            })
            .catch(
                (error) => {

                    console.log(
                        "خطای آهنگ:",
                        error
                    );

                }
            );

    }


    // =================================================
    // مخفی کردن پیام ورود
    // =================================================

   hideTouchGuide();

    touchMessage.style.transform =
        "translate(-50%, -50%) scale(0.95)";


    // =================================================
    // افزایش میزان تشکیل
    // =================================================

    progressTarget +=
        1 / FORMATION_PARTS;


    if (
        progressTarget > 1
    ) {

        progressTarget = 1;

    }
}


// =====================================================
// حرکت موس
// =====================================================

window.addEventListener(
    "mousemove",
    (event) => {

        // اولین حرکت

        if (
            lastMouseX === null
        ) {

            lastMouseX =
                event.clientX;

            lastMouseY =
                event.clientY;


            startExperience();

            return;
        }


        const dx =
            event.clientX -
            lastMouseX;


        const dy =
            event.clientY -
            lastMouseY;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        mouseDistance +=
            distance;


        lastMouseX =
            event.clientX;

        lastMouseY =
            event.clientY;


        // هر مقدار مشخص حرکت
        // یک مرحله

        while (
            mouseDistance >=
            MOUSE_DISTANCE_STEP
        ) {

            mouseDistance -=
                MOUSE_DISTANCE_STEP;


            startExperience();

        }
        lastMoveTime = Date.now();
         showTouchGuideAgain();
    }
);


// =====================================================
// لمس موبایل
// =====================================================

window.addEventListener(
    "touchstart",
    (event) => {

        // اگر اسم کامل شده یا اسکرول آزاد شده
        // دیگر لمس نباید اسم را خراب کند
        if (unlocked || progressTarget >= 1) {
            return;
        }

        event.preventDefault();

        // هر لمس موبایل = 3 مرحله
       if (!musicStarted) {

    weddingMusic.play()
        .then(() => {
            musicStarted = true;
        })
        .catch((error) => {
            console.log("موزیک اجرا نشد:", error);
        });

}

for (let i = 0; i < MOBILE_TOUCH_STEPS; i++) {
    startExperience();
}

    },
    {
        passive: false
    }
);

// =====================================================
// رسم ستاره‌های پس‌زمینه
// =====================================================

function drawBackgroundStars() {

    backgroundStars.forEach(
        (star) => {

            // چشمک زدن

            star.phase +=
                star.speed;


            let alpha =
                star.opacity +
                Math.sin(
                    star.phase
                ) * 0.18;


            if (
                star.bright
            ) {

                alpha =
                    0.55 +
                    Math.sin(
                        star.phase * 0.7
                    ) * 0.35;

            }


            alpha =
                Math.max(
                    0,
                    Math.min(
                        1,
                        alpha
                    )
                );


            // ستاره

            ctx.beginPath();

            ctx.arc(
                star.x,
                star.y,
                star.size,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                `rgba(
                    255,
                    255,
                    255,
                    ${alpha}
                )`;


            ctx.fill();


            // هاله ستاره‌های خاص

            if (
                star.bright
            ) {

                const glow =
                    ctx.createRadialGradient(
                        star.x,
                        star.y,
                        0,
                        star.x,
                        star.y,
                        star.size * 5
                    );


                glow.addColorStop(
                    0,
                    "rgba(255,255,255,0.35)"
                );


                glow.addColorStop(
                    1,
                    "rgba(255,255,255,0)"
                );


                ctx.beginPath();

                ctx.arc(
                    star.x,
                    star.y,
                    star.size * 3.5,
                    0,
                    Math.PI * 2
                );


                ctx.fillStyle =
                    glow;

                ctx.fill();

            }

        }
    );
}


// =====================================================
// حرکت ستاره‌های اسم
// =====================================================

function drawFormationStars() {

    // =================================================
    // حرکت نرم progress
    // =================================================

    progressCurrent +=
        (
            progressTarget -
            progressCurrent
        ) * 0.018;


    // =================================================
    // تعداد ستاره‌های فعال
    // =================================================

    const targetCount =
        Math.floor(
            formationStars.length *
            progressCurrent
        );


    // =================================================
    // فعال کردن ستاره‌ها
    // =================================================

    for (
        let i = 0;
        i < targetCount;
        i++
    ) {

        const star =
            formationStars[i];


        if (
            !star.active
        ) {

            star.active =
                true;

            star.progress =
                0;

            star.opacity =
                0;

        }

    }


    // =================================================
    // حرکت ستاره‌ها
    // =================================================

    formationStars.forEach(
        (star) => {

            if (
                !star.active
            ) {

                return;

            }


            // -----------------------------------------
            // ظاهر شدن
            // -----------------------------------------

            star.opacity +=
                (
                    1 -
                    star.opacity
                ) * 0.025;


            // -----------------------------------------
            // فاصله تا مقصد
            // -----------------------------------------

            const dx =
                star.targetX -
                star.x;


            const dy =
                star.targetY -
                star.y;


            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            // -----------------------------------------
            // چرخش ظریف
            // -----------------------------------------

            star.angle +=
                0.012;


            const swirlAmount =
                Math.min(
                    distance * 0.08,
                    star.swirl
                );


            const swirlX =
                Math.cos(
                    star.angle
                ) *
                swirlAmount;


            const swirlY =
                Math.sin(
                    star.angle
                ) *
                swirlAmount;


            // -----------------------------------------
            // سرعت تشکیل
            // -----------------------------------------

            const formationSpeed =
    window.innerWidth <= 600
        ? 0.045
        : 0.012;


            // -----------------------------------------
            // حرکت ستاره
            // -----------------------------------------

            star.x +=
                (
                    dx +
                    swirlX
                ) *
                formationSpeed;


            star.y +=
                (
                    dy +
                    swirlY
                ) *
                formationSpeed;


            // -----------------------------------------
            // وقتی خیلی نزدیک شد
            // -----------------------------------------

            if (
                distance < 1.5
            ) {

                star.x =
                    star.targetX;

                star.y =
                    star.targetY;

            }


            // -----------------------------------------
            // رسم
            // -----------------------------------------

            ctx.beginPath();

            ctx.arc(
                star.x,
                star.y,
                star.size,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                `rgba(
                    255,
                    255,
                    255,
                    ${star.opacity}
                )`;


            ctx.fill();

        }
    );
}


// =====================================================
// بررسی زمان آزاد شدن اسکرول
// =====================================================

function checkCompletion() {

    // حدود 93 درصد تشکیل

    if (
        progressCurrent >=
        UNLOCK_PROGRESS &&

        !completionStarted
    ) {

        completionStarted =
            true;


        // اول اسکرول آزاد شود

        unlockScrolling();


        // سپس نور طلایی

        showGoldenLight();

    }
}


// =====================================================
// آزاد کردن اسکرول
// =====================================================

function unlockScrolling() {

    // اگر قبلاً باز شده
    // دوباره کاری نکن

    if (
        unlocked
    ) {

        return;

    }


    unlocked =
        true;


    // =================================================
    // باز کردن اسکرول عمودی
    // =================================================

    document.body.style.overflowY =
        "auto";

    document.documentElement.style.overflowY =
        "auto";


    // جلوگیری از اسکرول افقی

    document.body.style.overflowX =
        "hidden";

    document.documentElement.style.overflowX =
        "hidden";


    // =================================================
    // نمایش فلش
    // =================================================

    setTimeout(
        () => {

            scrollHint.style.opacity =
                "1";


            scrollHint.style.transform =
                "translateX(-50%) translateY(0)";

        },
        500
    );
}


// =====================================================
// نمایش نور طلایی
// =====================================================

function showGoldenLight() {

    goldenLight.classList.add(
        "show"
    );
}


// =====================================================
// انیمیشن اصلی
// =====================================================

function animate() {

    const width =
        window.innerWidth;

    const height =
        window.innerHeight;


    // پاک کردن Canvas

    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    // آسمان

    drawBackgroundStars();


    // اسم

    drawFormationStars();


    // بررسی اسکرول

    checkCompletion();


    requestAnimationFrame(
        animate
    );
}


animate();


// =====================================================
// Resize
// =====================================================

window.addEventListener(
    "resize",
    () => {

        // اگر اسم قبلاً کامل شده،
        // به هیچ عنوان دوباره ساخته نشود
        if (unlocked) {
            return;
        }

        const savedTarget =
            progressTarget;

        const savedCurrent =
            progressCurrent;


        resizeCanvas();

        createBackgroundStars();

        createFormationStars();


        // پیشرفت قبلی حفظ شود
        progressTarget =
            savedTarget;

        progressCurrent =
            savedCurrent;

    }
);

// =====================================================
// تشخیص اسکرول
// =====================================================

window.addEventListener(
    "scroll",
    () => {

        if (
            window.scrollY >
            window.innerHeight * 0.5
        ) {

            document.body.classList.add(
                "invitation-active"
            );

        }

        else {

            document.body.classList.remove(
                "invitation-active"
            );

        }

    }
);


// =====================================================
// Reveal
// =====================================================

const reveals =
    document.querySelectorAll(
        ".reveal"
    );


window.addEventListener(
    "scroll",
    () => {

        const trigger =
            window.innerHeight *
            0.8;


        reveals.forEach(
            (item) => {

                const top =
                    item
                        .getBoundingClientRect()
                        .top;


                if (
                    top < trigger
                ) {

                    item.classList.add(
                        "show"
                    );

                }

            }
        );

    }
);
const scratchCanvas = document.getElementById("scratch");
const scratchCtx = scratchCanvas.getContext("2d");

const hint = document.querySelector(".hint");

let drawing = false;
let erasedAmount = 0;
let scratchCompleted = false;
let hintHidden = false;

function setCanvasSize(){

    scratchCanvas.width = scratchCanvas.offsetWidth;
    scratchCanvas.height = scratchCanvas.offsetHeight;

    // اگر مه قبلاً پاک شده، دوباره ساخته نشه
    if (scratchCompleted) {

        scratchCtx.clearRect(
            0,
            0,
            scratchCanvas.width,
            scratchCanvas.height
        );

        return;
    }

    scratchCtx.globalCompositeOperation =
        "source-over";

    scratchCtx.fillStyle =
        "rgba(245,235,220,0.97)";

    scratchCtx.fillRect(
        0,
        0,
        scratchCanvas.width,
        scratchCanvas.height
    );
}


setCanvasSize();


window.addEventListener(
    "resize",
    setCanvasSize
);





function erase(x, y) {

    if (scratchCompleted) return;

    scratchCtx.globalCompositeOperation =
        "destination-out";

    scratchCtx.beginPath();

    scratchCtx.arc(
        x,
        y,
        25,
        0,
        Math.PI * 2
    );

    scratchCtx.fill();

    erasedAmount++;

    // بعد از کمی کشیدن، راهنما محو شود
    if (erasedAmount > 15 && !hintHidden) {

        hintHidden = true;

        setTimeout(() => {

            hint.classList.add("hide");

            document.querySelector(".date-reveal")
                .classList.add("show-content");

        }, 250);
    }
}



// لپ تاپ
scratchCanvas.addEventListener("mousedown",()=>{

    drawing = true;

});


window.addEventListener("mouseup",()=>{

    drawing = false;

});


scratchCanvas.addEventListener("mousemove",(e)=>{

    if(!drawing) return;


    const rect = scratchCanvas.getBoundingClientRect();


    erase(
        e.clientX - rect.left,
        e.clientY - rect.top
    );

});



// موبایل
scratchCanvas.addEventListener("touchstart", (e) => {

    if (scratchCompleted) return;

    e.preventDefault();

}, { passive: false });

scratchCanvas.addEventListener("touchmove",(e)=>{

    e.preventDefault();


    const rect = scratchCanvas.getBoundingClientRect();


    erase(
        e.touches[0].clientX - rect.left,
        e.touches[0].clientY - rect.top
    );


},{passive:false});

const weddingDate = new Date(
    2026,
    8,
    16,
    16,
    30,
    0
).getTime();


setInterval(function(){

    const now = new Date().getTime();

    const distance = weddingDate - now;


    const days = Math.floor(distance / (1000 * 60 * 60 * 24));

    const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24))
        /(1000 * 60 * 60)
    );


    const minutes = Math.floor(
        (distance % (1000 * 60 * 60))
        /(1000 * 60)
    );


    const seconds = Math.floor(
        (distance % (1000 * 60))
        /1000
    );


    document.getElementById("days").innerHTML = days;

    document.getElementById("hours").innerHTML = hours;

    document.getElementById("minutes").innerHTML = minutes;

    document.getElementById("seconds").innerHTML = seconds;


},1000);
