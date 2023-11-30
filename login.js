const video = document.getElementById('video')
const login = document.querySelector('.container button')

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}


video.addEventListener('play', async () => {
  const LabeledFaceDescriptors = await loadLabeledImages()
  const faceMatcher = new faceapi.FaceMatcher(LabeledFaceDescriptors, 0.6)
  const displaySize = { width: video.width, height: video.height }
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)

    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    let matcher = results[0]
    const { _label, _distance } = matcher
    if (_label === 'ceejay') {
      login.classList.add('active')
      login.innerHTML = '<a href="index.html">Login</a>'
    } else {
      login.classList.remove('active')
    }
    console.log(_label);
    
  }, 8000)
})


function loadLabeledImages() {
  const labels = ['ceejay']

  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      for (let i = 1; i <= 7; i++) {
        const img = await faceapi.fetchImage(`https://ceejay412.github.io/ceejay1/${label}/${i}.jpg`)
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor)
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}