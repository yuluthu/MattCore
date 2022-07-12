$(document).ready(function () {
    $('textarea').each(function () {
        textAreaAdjust(this)
    })
}).on('keyup', 'textarea', function () {
    textAreaAdjust  (this);
});

function textAreaAdjust (o) {
    o.style.height = "1px";
    o.style.height = (o.scrollHeight)+"px";
}