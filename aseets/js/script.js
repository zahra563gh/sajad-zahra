const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

const textCanvas = document.getElementById("textCanvas");
const textCtx = textCanvas.getContext("2d");

const touchMessage = document.getElementById("touchMessage");
const goldenLight = document.getElementById("goldenLight");
const scrollHint = document.getElementById("scrollHint");
const weddingMusic = document.getElementById("weddingMusic");


// اسم
const text = "SAJAD & ZAHRA";


// تنظیمات

const BACKGROUND_STARS = 500;

const MOUSE_DISTANCE_STEP = 90;

const FORMATION_PARTS = 12;


// متغیرها

let backgroundStars = [];

let formationStars = [];

let textPoints = [];

let progressTarget = 0;

let progressCurrent = 0;

let musicStarted = false;

let unlocked = false;


let lastMouseX = null;
let lastMouseY = null;

let mouseDistance = 0;



// تنظیم اندازه صفحه

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    textCanvas.width = window.innerWidth;
    textCanvas.height = window.innerHeight;

}


resizeCanvas();



// ===============================
// ساخت ستاره‌های آسمان
// ===============================


function createBackgroundStars() {

    backgroundStars = [];


    for (let i = 0; i < BACKGROUND_STARS; i++) {


        backgroundStars.push({

            x: Math.random() * canvas.width,

            y: Math.random() * canvas.height,


            size:
                Math.random() * 1.4 + 0.2,


            opacity:
                Math.random() * 0.7 + 0.2,


            speed:
                Math.random() * 0.02 + 0.005,


            phase:
                Math.random() * Math.PI * 2,


            // چند ستاره درخشان

            bright:
                Math.random() > 0.96

        });

    }

}




// ===============================
// ساخت نقاط اسم
// ===============================


function createTextPoints() {


    textCtx.clearRect(
        0,
        0,
        textCanvas.width,
        textCanvas.height
    );


    let fontSize =
        Math.min(
            canvas.width * 0.12,
            110
        );


    if (canvas.width < 600) {

        fontSize =
            Math.min(
                canvas.width * 0.11,
                65
            );

    }



    textCtx.font =
        `bold ${fontSize}px Arial`;



    while (
        textCtx.measureText(text).width >
        canvas.width * 0.85
    ) {

        fontSize--;

        textCtx.font =
            `bold ${fontSize}px Arial`;

    }



    textCtx.textAlign =
        "center";

    textCtx.textBaseline =
        "middle";


    textCtx.fillStyle =
        "white";



    textCtx.fillText(

        text,

        canvas.width / 2,

        canvas.height / 2

    );



    const data =
        textCtx.getImageData(

            0,
            0,
            canvas.width,
            canvas.height

        );



    let points = [];



    const gap = 2.2;



    for (
        let y = 0;
        y < canvas.height;
        y += gap
    ) {


        for (
            let x = 0;
            x < canvas.width;
            x += gap
        ) {



            const index =
                (
                    Math.floor(y) *
                    canvas.width +
                    Math.floor(x)

                ) * 4;



            if (
                data.data[index + 3] > 150
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





// ===============================
// ساخت ستاره‌های اسم
// ===============================


function createFormationStars() {


    textPoints =
        createTextPoints();



    formationStars = [];



    textPoints.forEach((point, index) => {


        const angle =
            Math.random() *
            Math.PI *
            2;


        const distance =
            250 +
            Math.random() * 300;



        formationStars.push({


            x:
                point.x +
                Math.cos(angle) * distance,


            y:
                point.y +
                Math.sin(angle) * distance,



            targetX:
                point.x,


            targetY:
                point.y,



            size:
                Math.random() * 1.5 + 0.4,



            opacity:
                0,



            active: false,



            progress: 0,



            delay:
                index * 8,



            angle: angle,



            swirl:
                Math.random() * 25 + 15


        });



    });




    // مرتب سازی برای تشکیل از چپ به راست

    formationStars.sort(
        (a, b) =>
            a.targetX - b.targetX
    );



}



createBackgroundStars();

createFormationStars();


// ===============================
// شروع تعامل
// ===============================


function startExperience() {


    if (!musicStarted) {


        weddingMusic.play()
            .then(() => {
                console.log("آهنگ شروع شد");
            })
            .catch((error) => {
                console.log("خطای آهنگ:", error);
            });

    }

    touchMessage.style.opacity = "0";


    progressTarget +=
        1 / FORMATION_PARTS;


    if (progressTarget > 1) {

        progressTarget = 1;

    }


}
// ===============================
// حرکت موس
// ===============================

window.addEventListener("mousemove", (event) => {

    // اولین حرکت موس
    if (lastMouseX === null) {

        lastMouseX = event.clientX;
        lastMouseY = event.clientY;

        // همان اولین حرکت هم یک مرحله باشد
        startExperience();

        return;
    }


    const dx =
        event.clientX - lastMouseX;

    const dy =
        event.clientY - lastMouseY;


    const distance =
        Math.sqrt(dx * dx + dy * dy);


    mouseDistance += distance;


    lastMouseX = event.clientX;
    lastMouseY = event.clientY;


    // هر مقدار مشخصی حرکت = یک مرحله
    while (mouseDistance >= MOUSE_DISTANCE_STEP) {

        mouseDistance -= MOUSE_DISTANCE_STEP;

        startExperience();

    }

});


// ===============================
// لمس موبایل
// ===============================

window.addEventListener(
    "touchstart",
    (event) => {

        event.preventDefault();

        startExperience();

    },
    {
        passive: false
    }
);



// ===============================
// رسم ستاره‌های معمولی
// ===============================

function drawBackgroundStars() {

    backgroundStars.forEach((star) => {


        // چشمک زدن
        star.phase += star.speed;


        let alpha =
            star.opacity +
            Math.sin(star.phase) * 0.18;


        if (star.bright) {

            // ستاره‌های درخشان
            alpha =
                0.55 +
                Math.sin(star.phase * 0.7) * 0.35;

        }


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
            `rgba(255,255,255,${alpha})`;


        ctx.fill();



        // هاله برای ستاره‌های خاص
        if (star.bright) {

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


            ctx.fillStyle = glow;

            ctx.fill();

        }

    });

}



// ===============================
// حرکت ستاره‌های اسم
// ===============================

function drawFormationStars() {


    // نرم شدن میزان پیشرفت
    progressCurrent +=
        (
            progressTarget -
            progressCurrent
        ) * 0.018;



    // تعداد ستاره‌هایی که اجازه تشکیل دارند

    const targetCount =
        Math.floor(
            formationStars.length *
            progressCurrent
        );



    // فعال کردن ستاره‌ها
    // یکی‌یکی و آرام

    for (
        let i = 0;
        i < targetCount;
        i++
    ) {

        const star =
            formationStars[i];


        if (!star.active) {

            star.active = true;

            star.progress = 0;

            star.opacity = 0;

        }

    }



    // حرکت تک تک ستاره‌ها

    formationStars.forEach((star) => {


        if (!star.active) {

            return;

        }



        // -------------------------------
        // ظاهر شدن خیلی نرم
        // -------------------------------

        star.opacity +=
            (1 - star.opacity) *
            0.025;



        // -------------------------------
        // فاصله از مقصد
        // -------------------------------

        const dx =
            star.targetX -
            star.x;


        const dy =
            star.targetY -
            star.y;



        // -------------------------------
        // چرخش خیلی ظریف
        // -------------------------------

        star.angle += 0.012;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        const swirlAmount =
            Math.min(
                distance * 0.08,
                star.swirl
            );


        const swirlX =
            Math.cos(star.angle) *
            swirlAmount;


        const swirlY =
            Math.sin(star.angle) *
            swirlAmount;



        // -------------------------------
        // حرکت آرام به سمت حرف
        // -------------------------------

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



        // -------------------------------
        // وقتی خیلی نزدیک شد
        // -------------------------------

        if (distance < 1.5) {

            star.x =
                star.targetX;

            star.y =
                star.targetY;

        }



        // -------------------------------
        // رسم ستاره
        // -------------------------------

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


    });

}



// ===============================
// بررسی کامل شدن اسم
// ===============================

let completionStarted = false;


function checkCompletion() {


    if (
        progressTarget >= 1 &&
        progressCurrent > 0.995 &&
        !completionStarted
    ) {

        completionStarted = true;


        // یک مکث کوتاه تا آخرین ستاره‌ها
        // کاملاً سر جایشان بنشینند

        setTimeout(() => {

            showGoldenLight();

        }, 1000);

    }

}

// ===============================
// نور طلایی
// ===============================

function showGoldenLight() {


    goldenLight.classList.add("show");


    // بعد از عبور نور
    // فلش ظاهر شود

    setTimeout(() => {

        scrollHint.style.opacity = "1";


        scrollHint.style.transform =
            "translateX(-50%) translateY(0)";


    }, 1700);



    // کمی بعد اسکرول آزاد شود

    setTimeout(() => {

        unlocked = true;

        document.body.style.overflow = "auto";

        document.documentElement.style.overflow =
            "auto";


    }, 2200);

}


// ===============================
// انیمیشن اصلی
// ===============================

function animate() {


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // آسمان
    drawBackgroundStars();


    // اسم
    drawFormationStars();


    // بررسی کامل شدن
    checkCompletion();


    requestAnimationFrame(animate);

}



animate();



// ===============================
// ریسپانسیو
// ===============================

window.addEventListener(
    "resize",
    () => {

        resizeCanvas();

        createBackgroundStars();

        createFormationStars();


        // اگر اسم هنوز کامل نشده،
        // دوباره از اول تنظیم شود

        if (!unlocked) {

            progressTarget = 0;

            progressCurrent = 0;

            completionStarted = false;

        }

    }
);
window.addEventListener("scroll", () => {

    if(window.scrollY > window.innerHeight * 0.5){

        document.body.classList.add("invitation-active");

    } else {

        document.body.classList.remove("invitation-active");

    }

});
const reveals = document.querySelectorAll(".reveal");


window.addEventListener("scroll", () => {

    const trigger =
        window.innerHeight * 0.8;


    reveals.forEach((item)=>{

        const top =
            item.getBoundingClientRect().top;


        if(top < trigger){

            item.classList.add("show");

        }

    });

});
