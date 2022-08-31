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
export class Scrolling {
    constructor(activePage) {
        this.activePage = activePage;
        this.startY = null;
        this.startX = null;
        this.scrollLeft = null;
        this.scrollTop = null;
        this.isDown = null;
        activePage.addEventListener("mousedown", this.mouseIsDown.bind(this));
        activePage.addEventListener("mouseup", this.mouseUp.bind(this));
        activePage.addEventListener("mouseleave", this.mouseLeave.bind(this));
        activePage.addEventListener("mousemove", this.mouseMove.bind(this));
    }

    mouseIsDown(e) {
        this.isDown = true;
        this.startY = e.pageY - this.activePage.offsetTop;
        this.startX = e.pageX - this.activePage.offsetLeft;
        this.scrollLeft = this.activePage.scrollLeft;
        this.scrollTop = this.activePage.scrollTop;
        console.log(this);
        console.log(`mouseIsDown: ${this.activePage.id}`);
    }
    mouseUp(e) {
        this.isDown = false;
        console.log(`mouseUp`);
    }
    mouseLeave(e) {
        this.isDown = false;
        console.log(`mouseLeave`);
    }
    mouseMove(e) {
        if (this.isDown) {
            e.preventDefault();
            //Move vertcally
            const y = e.pageY - this.activePage.offsetTop;
            const walkY = y - this.startY;
            console.log(
                `scrollTop ${this.activePage.scrollTop} offsetTop ${this.activePage.offsetTop}`
            );
            this.activePage.scrollTop = this.scrollTop - walkY;
            console.log(y, walkY);

            //Move Horizontally
            const x = e.pageX - this.activePage.offsetLeft;
            const walkX = x - this.startX;
            this.activePage.scrollLeft = this.scrollLeft - walkX;
            console.log(`mouseMove`);
        }
    }
}
