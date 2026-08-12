const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

const textCanvas = document.getElementById("textCanvas");
const textCtx = textCanvas.getContext("2d");

const touchMessage = document.getElementById("touchMessage");
const goldenLight = document.getElementById("goldenLight");
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


// درصدی که بعد از آن اسکرول آزاد می‌شود
// 0.88 = 88 درصد
const UNLOCK_PROGRESS = 0.88;


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

let lastMouseX = null;
let lastMouseY = null;

let mouseDistance = 0;


// =====================================================
// اندازه Canvas
// =====================================================

function resizeCanvas() {

    const width = window.innerWidth;
    const height = window.innerHeight;

    const dpr = Math.min(
        window.devicePixelRatio || 1,
        2
    );


    // -------------------------------
    // Canvas اصلی
    // -------------------------------

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";


    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );


    // -------------------------------
    // Canvas متن
    // -------------------------------

    textCanvas.width = Math.floor(width * dpr);
    textCanvas.height = Math.floor(height * dpr);

    textCanvas.style.width = width + "px";
    textCanvas.style.height = height + "px";


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
// ساخت ستاره‌های آسمان
// =====================================================

function createBackgroundStars() {

    backgroundStars = [];


    const width = window.innerWidth;
    const height = window.innerHeight;


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
                Math.random() * 1.4 + 0.2,

            opacity:
                Math.random() * 0.7 + 0.2,

            speed:
                Math.random() * 0.02 + 0.005,

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

    const width = window.innerWidth;
    const height = window.innerHeight;


    // پاک کردن Canvas متن

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
                width * 0.115,
                52
            );

    }

    else if (width <= 600) {

        fontSize =
            Math.min(
                width * 0.12,
                58
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


    // مطمئن می‌شویم اسم از صفحه بیرون نزند

    while (
        textCtx.measureText(text).width >
        width * 0.86
    ) {

        fontSize--;

        textCtx.font =
            `700 ${fontSize}px Arial`;
    }


    // =================================================
    // مرکز واقعی صفحه
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


    // =================================================
    // نوشتن اسم دقیقاً وسط
    // =================================================

    textCtx.fillText(
        text,
        centerX,
        centerY
    );


    // =================================================
    // دریافت پیکسل‌ها
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


    // =================================================
    // فاصله نقاط
    // =================================================

    let gap;


    if (width <= 600) {

        // موبایل:
        // نقاط کمی متراکم‌تر برای کیفیت بهتر

        gap = 2.7;

    }

    else {

        gap = 2.8;

    }


    // =================================================
    // پیدا کردن نقاط متن
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
                Math.floor(x * dpr);

            const pixelY =
                Math.floor(y * dpr);


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
// ساخت ستاره‌های اسم
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


                // وضعیت

                active:
                    false,


                progress:
                    0,


                // کمی اختلاف زمانی

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


    // =================================================
    // مرتب‌سازی
    // برای تشکیل طبیعی‌تر از چپ به راست
    // =================================================

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


// =====================================================
// شروع تعامل
// =====================================================

function startExperience() {

    // -----------------------------------------------
    // موزیک
    // -----------------------------------------------

    if (
        !musicStarted
    ) {

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


    // -----------------------------------------------
    // حذف پیام ورود
    // -----------------------------------------------

    touchMessage.style.opacity =
        "0";


    touchMessage.style.transform =
        "translate(-50%, -50%) scale(0.95)";


    // -----------------------------------------------
    // افزایش مرحله تشکیل
    // -----------------------------------------------

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

        // اگر اولین حرکت است

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

    }
);


// =====================================================
// لمس موبایل
// =====================================================

window.addEventListener(
    "touchstart",
    (event) => {

        // -------------------------------------------
        // اگر هنوز قفل هستیم
        // لمس باید تجربه را شروع کند
        // -------------------------------------------

        if (!unlocked) {

            event.preventDefault();

            startExperience();

        }

        // -------------------------------------------
        // اگر باز شده
        // دیگر preventDefault نداریم
        // تا اسکرول گوشی کاملاً طبیعی باشد
        // -------------------------------------------

    },
    {
        passive: false
    }
);


// =====================================================
// رسم ستاره‌های معمولی
// =====================================================

function drawBackgroundStars() {

    const width =
        window.innerWidth;

    const height =
        window.innerHeight;


    backgroundStars.forEach(
        (star) => {

            // ---------------------------------------
            // چشمک زدن
            // ---------------------------------------

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


            // محدود کردن شفافیت

            alpha =
                Math.max(
                    0,
                    Math.min(
                        1,
                        alpha
                    )
                );


            // ---------------------------------------
            // ستاره
            // ---------------------------------------

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


            // ---------------------------------------
            // هاله ستاره‌های خاص
            // ---------------------------------------

            if (
                star.bright
            ) {

                ctx.beginPath();

                ctx.arc(
                    star.x,
                    star.y,
                    star.size * 3.5,
                    0,
                    Math.PI * 2
                );


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

    // -----------------------------------------------
    // حرکت نرم progress
    // -----------------------------------------------

    progressCurrent +=
        (
            progressTarget -
            progressCurrent
        ) * 0.018;


    // -----------------------------------------------
    // تعداد ستاره‌های مجاز
    // -----------------------------------------------

    const targetCount =
        Math.floor(
            formationStars.length *
            progressCurrent
        );


    // -----------------------------------------------
    // فعال کردن ستاره‌ها
    // -----------------------------------------------

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


    // -----------------------------------------------
    // حرکت ستاره‌ها
    // -----------------------------------------------

    formationStars.forEach(
        (star) => {

            if (
                !star.active
            ) {

                return;

            }


            // ---------------------------------------
            // ظاهر شدن
            // ---------------------------------------

            star.opacity +=
                (
                    1 -
                    star.opacity
                ) * 0.025;


            // ---------------------------------------
            // فاصله از مقصد
            // ---------------------------------------

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


            // ---------------------------------------
            // چرخش خیلی ظریف
            // ---------------------------------------

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


            // ---------------------------------------
            // حرکت به سمت مقصد
            // ---------------------------------------

            star.x +=
                (
                    dx +
                    swirlX
                ) * 0.012;


            star.y +=
                (
                    dy +
                    swirlY
                ) * 0.012;


            // ---------------------------------------
            // نزدیک مقصد
            // ---------------------------------------

            if (
                distance < 1.5
            ) {

                star.x =
                    star.targetX;

                star.y =
                    star.targetY;

            }


            // ---------------------------------------
            // رسم ستاره
            // ---------------------------------------

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

    // -----------------------------------------------
    // وقتی تقریباً 88 درصد اسم تشکیل شد
    // -----------------------------------------------

    if (
        progressCurrent >=
        UNLOCK_PROGRESS &&

        !completionStarted
    ) {

        completionStarted =
            true;


        // -------------------------------------------
        // اسکرول همین‌جا آزاد می‌شود
        // -------------------------------------------

        unlockScrolling();


        // -------------------------------------------
        // نور طلایی
        // -------------------------------------------

        showGoldenLight();

    }
}


// =====================================================
// آزاد کردن اسکرول
// =====================================================

function unlockScrolling() {

    if (
        unlocked
    ) {

        return;

    }


    unlocked =
        true;


    // -----------------------------------------------
    // باز کردن اسکرول
    // -----------------------------------------------

    document.body.style.overflowY =
        "auto";

    document.documentElement.style.overflowY =
        "auto";


    document.body.style.overflowX =
        "hidden";

    document.documentElement.style.overflowX =
        "hidden";


    // -----------------------------------------------
    // نمایش فلش
    // -----------------------------------------------

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
// نور طلایی
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


    // -----------------------------------------------
    // پاک کردن صفحه
    // -----------------------------------------------

    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    // -----------------------------------------------
    // آسمان
    // -----------------------------------------------

    drawBackgroundStars();


    // -----------------------------------------------
    // اسم
    // -----------------------------------------------

    drawFormationStars();


    // -----------------------------------------------
    // بررسی باز شدن اسکرول
    // -----------------------------------------------

    checkCompletion();


    requestAnimationFrame(
        animate
    );
}


animate();


// =====================================================
// ریسپانسیو
// =====================================================

window.addEventListener(
    "resize",
    () => {

        resizeCanvas();


        createBackgroundStars();

        createFormationStars();


        // اگر هنوز اسکرول باز نشده
        // اسم از ابتدا دوباره تنظیم شود

        if (
            !unlocked
        ) {

            progressTarget =
                0;

            progressCurrent =
                0;

            completionStarted =
                false;

        }

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
// انیمیشن‌های Reveal
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
                    item.getBoundingClientRect()
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
