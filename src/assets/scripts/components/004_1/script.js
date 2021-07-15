import { WebGLUtility } from './webgl.js';
import vertexShaderSource from '../../glsl/004_1/main.vert';
import fragmentShaderSource from '../../glsl/004_1/main.frag';

// = 004 ======================================================================
// このサンプルは、最初の状態では 003 とまったく同じ内容です。
// これを、みなさん自身の手で修正を加えて「描かれる図形を五角形に」してみてくだ
// さい。
// そんなの余裕じゃろ～ と思うかも知れませんが……結構最初は難しく感じる人も多い
// かもしれません。なお、正確な正五角形でなくても良いものとします。
// ポイントは以下の点を意識すること！
// * canvas 全体が XY 共に -1.0 ～ 1.0 の空間になっている
// * gl.TRIANGLES では頂点３個がワンセットで１枚のポリゴンになる
// * つまりいくつかの頂点は「まったく同じ位置に重複して配置される」ことになる
// * 頂点座標だけでなく、頂点カラーも同じ個数分必要になる！
// ============================================================================

(() => {
    // 複数の関数で利用する広いスコープが必要な変数を宣言しておく
    let position = [];
    let color = [];
    let vbo = null;
    let indices = [];
    let ibo = null
    let uniform = null;
    let mouse = [0, 0];
    let rotation = null;
    let n = 5;
    let radius = 0.7;

    // webgl.js に記載のクラスをインスタンス化する
    const webgl = new WebGLUtility();

    // ドキュメントの読み込みが完了したら実行されるようイベントを設定する
    window.addEventListener('DOMContentLoaded', () => {
        const canvas = document.getElementById('webgl-canvas');
        webgl.initialize(canvas);
        handleResize();

        window.addEventListener('resize', () => {
            handleResize();
            render();
        }, false);

        // マウスカーソルが動いた際のイベントを登録しておく
        window.addEventListener('mousemove', (event) => {
            mouse[0] = event.clientX / window.innerWidth;
            mouse[1] = event.clientY / window.innerHeight;
        }, false);

        const toggles = document.querySelectorAll('[data-toggle]');
        toggles.forEach((toggle) => {
            console.log(toggle.getAttribute('data-toggle'));
            toggle.addEventListener('click', () => {
                position = [];
                color = [];
                let dataValue = toggle.getAttribute('data-toggle');
                switch (dataValue) {
                    case 'up':
                        n += 1;
                        break;
                    case 'down':
                        if ((n - 1) > 2) n -= 1;
                        break;
                }
                setPolygonInfo();
            }, false);
        });

        let vs = null;
        let fs = null;
        vs = webgl.createShaderObject(vertexShaderSource, webgl.gl.VERTEX_SHADER);
        fs = webgl.createShaderObject(fragmentShaderSource, webgl.gl.FRAGMENT_SHADER);
        webgl.program = webgl.createProgramObject(vs, fs);

        // 頂点とロケーションのセットアップは先に行っておく
        setupGeometry();
        setupLocation();

        // 準備ができたらレンダリングを開始
        render();
    }, false);

    /**
     * 頂点属性（頂点ジオメトリ）のセットアップを行う
     */
    function setupGeometry() {
        // position

        setPolygonInfo();
        // 配列に入れておく
        vbo = [
            webgl.createVBO(position),
            webgl.createVBO(color),
        ];

        ibo = webgl.createIBO(indices);
    }

    function setPolygonInfo() {
        const angle = 360 / n;
        for (let i = 0; i < 360; i += angle) {
            let px = Math.sin(i * (Math.PI / 180)) * radius;
            let py = Math.cos(i * (Math.PI / 180)) * radius;
            position.push(px, py, 0.0);

            if (px > 0) {
                color.push((py + 1) * 0.4, px, 0.0, 0.7);
            } else {
                color.push((py + 1) * 0.4, 0.0, Math.abs(px), 0.7);
            }

            let index = i / angle;
            if (index % 2 === 0) {
                indices.push(index + 1, index + 2, 0);
            } else {
                indices.push(0, index + 1, index + 2);
            }
        }
    }

    /**
     * 頂点属性のロケーションに関するセットアップを行う
     */
    function setupLocation() {
        const gl = webgl.gl;
        // attribute location の取得と有効化
        const attLocation = [
            gl.getAttribLocation(webgl.program, 'position'),
            gl.getAttribLocation(webgl.program, 'color'),
        ];
        const attStride = [3, 4];
        webgl.enableAttribute(vbo, attLocation, attStride);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

        // uniform 変数のロケーションを取得する
        uniform = {
            mouse: gl.getUniformLocation(webgl.program, 'mouse'),
            rotation: gl.getUniformLocation(webgl.program, 'rotation'),
        };
    }

    function handleResize() {
        const size = Math.min(window.innerWidth, window.innerHeight);
        webgl.width = size;
        webgl.height = size;
    }

    /**
     * レンダリングのためのセットアップを行う
     */
    function setupRendering() {
        const gl = webgl.gl;
        gl.viewport(0, 0, webgl.width, webgl.height);
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    /**
     * レンダリングを行う
     */
    function render() {
        const gl = webgl.gl;

        // 再帰呼び出しを行う
        requestAnimationFrame(render);

        setupGeometry();
        setupLocation();
        // レンダリング時のクリア処理など
        setupRendering();

        // uniform 変数は常に変化し得るので毎フレーム値を送信する
        gl.uniform2fv(uniform.mouse, mouse);

        // 登録されている VBO の情報をもとに頂点を描画する
        // gl.drawArrays(mode, first, count): 配列データからプリミティブを描画
        // (https://developer.mozilla.org/ja/docs/Web/API/WebGLRenderingContext/drawArrays)
        // gl.TRIANGLES: 頂点 3 つの集まりごとに、三角形を描画
        // gl.drawArrays(gl.TRIANGLES, 0, position.length / 3);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    }
})();

