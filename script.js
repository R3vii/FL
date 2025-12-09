const modal=document.getElementById('modal');
const modalImage=document.getElementById('modalImage');
const modalClose=document.getElementById('modalClose');
const coverImage=document.getElementById('coverImage');


coverImage.addEventListener('click',()=>{
modalImage.src=coverImage.src;
modal.setAttribute('aria-hidden','false');
});


modalClose.addEventListener('click',()=>{
modal.setAttribute('aria-hidden','true');
});


window.addEventListener('keydown',e=>{
if(e.key==='Escape') modal.setAttribute('aria-hidden','true');
});