let a = {
    b: '123456'
};
let b = 'b';
let c = 'c';
let d = 'd';
let arr = ['1', '2', '3'];

let arr1 = arr.map(item => {
    return item + b + c + d;
});

let arr2 = arr.map(function (item) {
    return item + b;
});

let fa = () => '123' + b;

let f = function () {
    console.log(123);
    return '123' + a.b.length;
}

let obj = {
    /**
     * aaa
     *
     * @ssr
     */
    a: function () {
        return '123' + b;
    },
    b() {
        /**
         * @ssr
         */
        const a = b;
        return '123' + b + a;
    }
}