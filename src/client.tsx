import * as React from "react";
import * as ReactDOM from "react-dom";
import css from "./css";

const styles = css({
    rootContainer: {
        width: "100%",
        height: "100%",
    },
    inview: {
        opacity: "1 !important",
    },
});

function throttle(callback: (a: any) => any, limit: number) {
    let wait = false;
    return (a: any) => {
        if (!wait) {
            callback(a);
            wait = true;
            setTimeout(() => {
                wait = false;
            }, limit);
        }
    };
}

interface IPoint {
    x: number;
    y: number;
};

const totalDivs = 1500;
const sampleDistance = 100;
const throttleTimeout = 200;
const viewThreshold = 0.75;
const divMeta = {};

function isInViewPort(rect: any, windowWidth: number, windowHeight: number) {
    const intersectionWidth = Math.min(Math.max(rect.right, 0), windowWidth) - Math.min(Math.max(rect.left, 0), windowWidth);
    const intersectionHeight = Math.min(Math.max(rect.bottom, 0), windowHeight) - Math.min(Math.max(rect.top, 0), windowHeight);
    const intersectionArea = ((intersectionHeight * intersectionWidth) / (rect.height * rect.width)) * 100;
    if (intersectionArea > 50) {
        return true;
    }
    return false;
}

function storeDivInfo(allDivs: Element[]) {
    for (let i = 0; i < allDivs.length; i++) {
        if (divMeta[allDivs[i].dataset.index]) {
            divMeta[allDivs[i].dataset.index].push({
                currentTime: new Date().getTime(),
                visibility: allDivs[i].innerHTML
            });
        } else {
            divMeta[allDivs[i].dataset.index] = [{
                currentTime: new Date().getTime(),
                visibility: allDivs[i].innerHTML
            }];
        }
    }
    console.log(divMeta);
}
function animationFrameCallback() {
    window.requestAnimationFrame(() => {
        console.time("animationFrame");
        const allDivs = document.querySelectorAll("[data-tracking]");
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const divs = [];
        const rects: ClientRect[] = [];
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < allDivs.length; i++) {
            const rect = allDivs[i].getBoundingClientRect();
            if (rect.right < 0 || rect.bottom < 0 || rect.left > viewportWidth || rect.top > viewportHeight) {
                continue;
            }
            if (!isInViewPort(rect, viewportWidth, viewportHeight)) {
                continue;
            }
            divs.push(allDivs[i]);
            rects.push(rect);
        }

        console.log("sampling for " + divs.length + " elements");

        // Store divs information
        storeDivInfo(divs);
        for (let i = 0; i < rects.length; i++) {
            // console.time("rect");
            const rect = rects[i];

            const pointsOnX = Math.min(10, Math.ceil(rect.width / sampleDistance));
            const pointsOnY = Math.min(10, Math.ceil(rect.height / sampleDistance));
            const jumpX = rect.width / (pointsOnX + 1);
            const jumpY = rect.height / (pointsOnY + 1);

            const pointsToCheck: number = pointsOnX * pointsOnY;
            let inView: number = pointsToCheck;

            for (let a = 0; a < pointsOnX; a++) {
                for (let b = 0; b < pointsOnY; b++) {
                    const x = Math.round(rect.left + jumpX * (a + 1));
                    const y = Math.round(rect.top + jumpY * (b + 1));

                    const item = document.elementFromPoint(x, y);
                    if (x < 0 || y < 0 || x > viewportWidth || y > viewportHeight) {
                        let isViewed = false;
                        for (let k = item; k !== null; k = k.parentElement) {
                            if (k === divs[i]) {
                                isViewed = true;
                                break;
                            }
                        }
                        if (!isViewed) {
                            inView--;
                        }
                    }
                }
            }

            // tslint:disable-next-line:prefer-for-of
            if (inView > pointsToCheck * viewThreshold) {
                divs[i].className = styles.inview;
            } else {
                divs[i].className = null;
            }
            divs[i].innerHTML = Math.round(inView * 100 / pointsToCheck) + "%";
            // console.timeEnd("rect");
        }
        console.timeEnd("animationFrame");
    });
}

window.addEventListener("scroll", throttle(animationFrameCallback, throttleTimeout));
window.addEventListener("resize", throttle(animationFrameCallback, throttleTimeout));

let elementBeingDragged: HTMLDivElement = null;
let originalX: number = 0;
let originalY: number = 0;

function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    elementBeingDragged = e.currentTarget;
    originalX = e.clientX;
    originalY = e.clientY;
}

function handleMouseUp(e: React.MouseEvent<HTMLDivElement>) {
    elementBeingDragged = null;
}

const handleMouseMove = throttle((e: React.MouseEvent<HTMLDivElement>) => {
    e.persist();
    requestAnimationFrame(() => {
        if (elementBeingDragged) {
            const top = parseInt(elementBeingDragged.style.top, 10);
            const left = parseInt(elementBeingDragged.style.left, 10);

            const deltaTop = e.clientY - originalY;
            const deltaLeft = e.clientX - originalX;
            originalX = e.clientX;
            originalY = e.clientY;

            const newTop = (top + deltaTop);
            const newLeft = (left + deltaLeft);
            elementBeingDragged.style.top = newTop + "px";
            elementBeingDragged.style.left = newLeft + "px";

            animationFrameCallback();
        };
    });
}, throttleTimeout);

function makeDivs(max: number) {
    const divs: JSX.Element[] = [];
    for (let i = 0; i < max; i++) {
        const style = {
            position: "absolute",
            display: "flex",
            justifyContent: "center" as "center",
            alignItems: "center",
            top: `${Math.random() * 5000}px`,
            left: `${Math.random() * 5000}px`,
            width: `${Math.random() * 500}px`,
            height: `${Math.random() * 500}px`,
            fontSize: "64px",
            // tslint:disable-next-line:max-line-length
            backgroundColor: `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}`,
            opacity: 0.5,
            border: "1px solid #aaa",
        };

        divs.push(
            <div
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                key={i}
                data-index={i}
                style={style}
                data-tracking
                />,
        );
    }
    return divs;
}

ReactDOM.render(
    <div className={styles.rootContainer}>
        {makeDivs(totalDivs)}
    </div>,
    document.getElementById("root"),
);