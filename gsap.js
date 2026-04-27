// 載入 ScrollTrigger
gsap.registerPlugin(ScrollTrigger)

// 第一幀
const scene1 = document.getElementById('scene1')
// 第二幀
const scene2 = document.getElementById('scene2')
// 第三幀
const scene3 = document.getElementById('scene3')
// 第四幀
const scene4 = document.getElementById('scene4')
// 第五幀
const scene5 = document.getElementById('scene5')
// 按鈕1：進入故事
const playBtn = document.getElementById('playBtn')
// 時間軸建立，影片一開始先paused
const tl = gsap.timeline({ paused: true })
// 按鈕2：開啟手機
const phoneBtn = document.getElementById('phoneBtn')

// 按鈕1：點擊進入故事後按鈕opacity調整為0
playBtn.addEventListener('click', () => {
    scene1.play()
    gsap.to(playBtn, { opacity: 0, duration: 0.3, pointerEvents: 'none' })
})

tl.to("#caption1", { opacity: 1, duration: 1 }, 0.01)
  .to('#caption1', { opacity: 0, duration: 0.3 })
  .to('#caption2', { opacity: 1, duration: 1 })
  .to('#caption2', { opacity: 0, duration: 0.3 })
  .to('#caption3', { opacity: 1, duration: 1 })
  .to('#caption3', { opacity: 0, duration: 0.3 })
  .to('#caption4', { opacity: 1, duration: 1.5 }, 6)
  .to('#caption4', { opacity: 0, duration: 0.3 })

scene1.addEventListener('timeupdate', () => {
    tl.time(scene1.currentTime)
})

// scene1 結束
scene1.addEventListener('ended', () => {
    gsap.to('.scene2-container', { opacity: 1, duration: 0.8 })
 
    // hintScrolling-img：scene2 出現後淡入，同時開始 y 軸來回浮動，使用者開始 scroll 後淡出並停止
    gsap.to('#hintScrolling-img', {
        opacity: 1,
        duration: 0.8,
        delay: 0.8,
        onComplete: () => {
            window._hintScrollAnim = gsap.to('#hintScrolling-img', {
                y: -12,
                duration: 0.9,
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true
            })
        }
    })
 
    gsap.to('#hintScrolling', { opacity: 1, duration: 0.8, delay: 0.8 })
 
    const hideHintOnScroll = () => {
        if (window._hintScrollAnim) {
            window._hintScrollAnim.kill()
            window._hintScrollAnim = null
        }
        gsap.to('#hintScrolling-img', { opacity: 0, y: 0, duration: 0.4 })
        gsap.to('#hintScrolling', { opacity: 0, duration: 0.4 })
        window.removeEventListener('scroll', hideHintOnScroll)
    }
    window.addEventListener('scroll', hideHintOnScroll, { passive: true })
 
    // 撐開頁面讓 scroll 有空間
    document.body.style.height = '600vh'
    document.body.style.overflow = 'scroll'
 
    scene2.addEventListener('loadedmetadata', setupScrollTriggers)
    if (scene2.readyState >= 1) setupScrollTriggers()
})

function setupScrollTriggers() {
    ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: '75% top',
        onUpdate: (self) => {
            // 只在 scene3 尚未啟動時才更新 scene2 時間
            if (!window._scene3Active) {
                scene2.currentTime = self.progress * scene2.duration
            }
        }
    })

    ScrollTrigger.create({
        trigger: document.body,
        start: '75% top',
        end: '75% top',
        onEnter: () => {
            window._scene3Active = true
            showScene3()
        },
        onLeaveBack: () => {
            window._scene3Active = false
            showScene2()
        }
    })
}
// Scene3 顯示：scene2 fade out 與 scene3 fade in 同時進行（crossfade，避免 scene1 露出）
function showScene3() {
    scene3.currentTime = 0
    scene3.addEventListener('ended', onScene3Ended)

    gsap.to('.scene2-container', { opacity: 0, duration: 0.6 })
    gsap.to('.scene3-container', { opacity: 1, duration: 0.6 })

    const playPromise = scene3.play()
    if (playPromise !== undefined) {
        playPromise.catch(() => {
            // play() 被封鎖時，直接略過影片跳到結束畫面
            scene3.removeEventListener('ended', onScene3Ended)
            onScene3Ended()
        })
    }
}

function onScene3Ended() {
    gsap.to('#scene3-img', { opacity: 1, duration: 0.5, pointerEvents: 'auto' })
    gsap.to('#phoneBtn', { opacity: 1, duration: 0.5, delay: 0.3, pointerEvents: 'auto' })
    scene3.removeEventListener('ended', onScene3Ended)

    // scene3-img 出現後依序顯示三段字幕
    // caption5：出現後停留 0.5 秒再消失
    // caption6：接著出現，停留 0.5 秒再消失
    // caption7：出現後持續停留，直到 phoneBtn 被點擊
    const captionTl = gsap.timeline({ delay: 0.6 })
    captionTl
        .to('#caption5', { opacity: 1, duration: 0.6 })
        .to('#caption5', { opacity: 0, duration: 0.4, delay: 0.5 })
        .to('#caption6', { opacity: 1, duration: 0.6 })
        .to('#caption6', { opacity: 0, duration: 0.4, delay: 0.5 })
        .to('#caption7', { opacity: 1, duration: 0.4 })
        .to('#hintClick-img', { opacity: 1, duration: 0.5 })
        .call(() => {
            // caption7 出現後，hintClick-img 開始循環閃爍
            window._hintClickAnim = gsap.to('#hintClick-img', {
                opacity: 0,
                duration: 0.7,
                ease: 'power1.inOut',
                repeat: -1,
                yoyo: true
            })
        })
}

// Scene2 回復：scene3 fade out 與 scene2 fade in 同時進行（crossfade，避免 scene1 露出）
function showScene2() {
    scene3.pause()
    scene3.removeEventListener('ended', onScene3Ended)

    // 重置 scene3-img 與 phoneBtn
    gsap.to('#scene3-img', { opacity: 0, duration: 0.3, pointerEvents: 'none' })
    gsap.to('#phoneBtn', { opacity: 0, duration: 0.3, pointerEvents: 'none' })
    gsap.to(['#caption5', '#caption6', '#caption7'], { opacity: 0, duration: 0.3 })

    gsap.to('.scene3-container', { opacity: 0, duration: 0.6 })
    gsap.to('.scene2-container', {
        opacity: 1,
        duration: 0.6,
        onStart: () => { scene2.currentTime = scene2.duration } // 停在最後一幀
    })
}

phoneBtn.addEventListener('click', () => {
    // 隱藏 caption7
    gsap.to('#caption7', { opacity: 0, duration: 0.3 })
 
    // 停止 hintClick-img 閃爍並淡出
    if (window._hintClickAnim) {
        window._hintClickAnim.kill()
        window._hintClickAnim = null
    }
    gsap.to('#hintClick-img', { opacity: 0, duration: 0.3 })
 
    scene4.currentTime = 0
    // 確保 scene4 -> scene5 轉場時，其他 scenes 不會透出
    gsap.to('.scene1-container', { opacity: 0, duration: 0.3 })
    gsap.to('.scene2-container', { opacity: 0, duration: 0.3 })
    gsap.to('.scene3-container', { opacity: 0, duration: 0.3 })
    gsap.to('.scene4-container', { opacity: 1, duration: 0.6, pointerEvents: 'auto' })
    scene4.play()

    scene5.currentTime = 0
    scene5.load()

    // scene4 結束後接 scene5 循環播放
    scene4.addEventListener('ended', () => {
        scene5.loop = true
        gsap.to('.scene4-container', { opacity: 0, duration: 0.6 })
        gsap.to('.scene5-container', { opacity: 1, duration: 0, pointerEvents: 'auto' })
        scene5.play()

        // scene5 開始後淡入 hintClick 提示文字與圖片，並啟動閃爍動畫
        gsap.to('#hintClick', { opacity: 1, duration: 0.6, delay: 0.3, overwrite: true })
 
        // Mind bubbles 依序點擊出現：bubble1 先出現，點擊後消失再出現 bubble2，依此類推
        const bubbleIds = ['#mindbubble1','#mindbubble2','#mindbubble3','#mindbubble4','#mindbubble5','#mindbubble6']
        let currentBubbleIndex = 0
 
        function showBubble(index) {
            if (index >= bubbleIds.length) {
                // 所有 bubble 點擊完畢，停止閃爍並淡出 hint 提示
                if (window._hintClickScene5Anim) {
                    window._hintClickScene5Anim.kill()
                    window._hintClickScene5Anim = null
                }
                gsap.to('#hintClick-img-scene5', { opacity: 0, duration: 0.6 })
                gsap.to('#hintClick', { opacity: 0, duration: 0.6 })
                return
            }
 
            const id = bubbleIds[index]
            const el = document.querySelector(id)
 
            // 淡入當前 bubble，並開啟點擊事件
            gsap.to(id, { opacity: 1, duration: 0.6, ease: 'power1.inOut', onComplete: () => {
                el.style.pointerEvents = 'auto'
            }})
 
            // 點擊後：淡出當前，顯示下一個
            el.addEventListener('click', () => {
                el.style.pointerEvents = 'none'
                gsap.to(id, { opacity: 0, duration: 0.4, ease: 'power1.inOut', onComplete: () => {
                    currentBubbleIndex++
                    showBubble(currentBubbleIndex)
                }})
            }, { once: true })

            gsap.to('#hintClick-img-scene5', {
                opacity: 1,
                duration: 0.8,
                delay: 0.3,
                overwrite: true,
                onComplete: () => {
                    window._hintClickScene5Anim = gsap.to('#hintClick-img-scene5', {
                        opacity: 0,
                        duration: 0.7,
                        ease: 'power1.inOut',
                        repeat: -1,
                        yoyo: true
                    })
                }
            })
        }
        gsap.delayedCall(1.0, () => showBubble(0))
    }, { once: true })

    // 設定點擊互動提示
})