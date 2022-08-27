// Grab scroll code. todo todo
// (function () {
//     /***
//      *
//      * this is an implementation of Wes Bos click & drag scroll algorythm. In
//      * his video, he shows how to do the horizontal scroll. I have
//      * implemented
//      * the vertical scroll for those wondering how to make it as well.
//      *  Wes Bos video:
//      *  https://www.youtube.com/watch?v=C9EWifQ5xqA
//      */

//     let startY;
//     let startX;
//     let scrollLeft;
//     let scrollTop;
//     let isDown;

//     function addListeners() {
//         activePage.addEventListener("mousedown", (e) => mouseIsDown(e));
//         activePage.addEventListener("mouseup", (e) => mouseUp(e));
//         activePage.addEventListener("mouseleave", (e) => mouseLeave(e));
//         activePage.addEventListener("mousemove", (e) => mouseMove(e));
//     }

//     function mouseIsDown(e) {
//         isDown = true;
//         startY = e.pageY - activePage.offsetTop;
//         startX = e.pageX - activePage.offsetLeft;
//         scrollLeft = activePage.scrollLeft;
//         scrollTop = activePage.scrollTop;
//         console.log(`mouseIsDown: ${activePage.id}`);
//     }
//     function mouseUp(e) {
//         isDown = false;
//         console.log(`mouseUp`);
//     }
//     function mouseLeave(e) {
//         isDown = false;
//         console.log(`mouseLeave`);
//     }
//     function mouseMove(e) {
//         if (isDown) {
//             e.preventDefault();
//             //Move vertcally
//             const y = e.pageY - activePage.offsetTop;
//             const walkY = y - startY;
//             activePage.scrollTop = scrollTop - walkY;

//             //Move Horizontally
//             const x = e.pageX - activePage.offsetLeft;
//             const walkX = x - startX;
//             activePage.scrollLeft = scrollLeft - walkX;
//             console.log(`mouseMove`);
//         }
//     }
// })();
