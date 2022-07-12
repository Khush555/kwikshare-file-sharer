const dropzone = document.querySelector(".drop-zone")
const browseBtn = document.querySelector(".browseBtn")
const fileInput= document.querySelector("#fileInput")

const progressContainer = document.querySelector(".progress-container")
const bgProgress = document.querySelector(".bg-progress")
const progressBar= document.querySelector(".progress-bar")
const percentDiv = document.querySelector("#percent")
const inputContainer=document.querySelector(".input-container");

const sharingContainer= document.querySelector(".sharing-container")
const fileURLInput= document.querySelector("#fileURL")
const copyBtn = document.querySelector("#copyBtn")


const emailForm=document.querySelector("#emailForm")

const toast = document.querySelector(".toast")

const host = "https://kwikshare.herokuapp.com/"
const uploadURL = `${host}api/files`;
const emailURL = `${host}api/files/send`;

const maxAllowedSize= 100*1024*1024; //100MB

dropzone.addEventListener("dragover", (e)=>{
    e.preventDefault()
    if(!dropzone.classList.contains("dragged")){
        dropzone.classList.add("dragged")
    }
    
});

dropzone.addEventListener("dragleave",()=>{
    dropzone.classList.remove("dragged")
})
dropzone.addEventListener("drop",(e)=>{
    e.preventDefault()
    dropzone.classList.remove("dragged")
    const files= e.dataTransfer.files
    if(files.length){
    fileInput.files = files;
    uploadFile()
    }
})

fileInput.addEventListener("change",()=>{
    uploadFile()
})


browseBtn.addEventListener("click", ()=>{
    fileInput.click()
})

copyBtn.addEventListener("click",()=>{
    fileURLInput.select();
    document.execCommand("copy");
    showToast("Link copied!");
})



const uploadFile = ()=>{
    
    if(fileInput.files.length> 1){
        resetFileInput();
        showToast("You can only upload 1 file")
        return;
    }
    const file = fileInput.files[0]
    if(file.size > maxAllowedSize){
        showToast("You can only upload file whose size is less than 100MB")
        resetFileInput();
        return;
    }
    progressContainer.style.display="block"
    
    const formData = new FormData()
    formData.append("myfile",file)
    const xhr = new XMLHttpRequest();
    //
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState===XMLHttpRequest.DONE){
        console.log(JSON.parse(xhr.response));
        onUploadSuccess(JSON.parse(xhr.response))
        }
    }

    xhr.upload.onprogress = updateProgress;
    xhr.upload.onerror = ()=>{
        fileInput.value="";
        showToast(`Error in upload ${xhr.statusText}`)
    }
    xhr.open("POST", uploadURL);
    xhr.send(formData)
}
const updateProgress = (e)=>{
    const percent = Math.round((e.loaded/e.total) *100);
    //console.log(percent);
    bgProgress.style.width = `${percent}%`
    percentDiv.innerText=percent
    progressBar.style.transform = `scaleX(${percent/100})`
}

const onUploadSuccess  = ({file: url})=>{
    console.log(url);
    resetFileInput()
    emailForm[2].removeAttribute("disabled");
    progressContainer.style.display="none";
    sharingContainer.style.display="block";
    fileURLInput.value=url;

}

const resetFileInput = ()=>{
    fileInput.value ="";
}

emailForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    const url=fileURLInput.value;
    const formData ={
        uuid: url.split("/").splice(-1,1)[0],
        emailTo: emailForm.elements["to-email"].value,
        emailFrom: emailForm.elements["from-email"].value,
    };
emailForm[2].setAttribute("disabled", "true");
    console.log(formData);

    fetch(emailURL,{
        method: "POST",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    }).then(res => res.json()).then(({success})=>{
        if (success) {
            sharingContainer.style.display="none";
            showToast("Email Sent :)")
        }
    })
})

let toastTimer;
const showToast = (msg)=>{
    toast.innerText= msg;
    toast.style.transform = "translate(-50%,0)";
    clearTimeout(toastTimer)
    toastTimer= setTimeout(()=>{
        toast.style.transform = "translate(-50%,120px)";
    },2000)
}