declare global {
 interface Window {dataLayer:unknown[];gtag:(command:string,...args:unknown[])=>void;}
}

const measurementId=import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();

export function validMeasurementId(value:unknown):value is string{
 return typeof value==='string'&&/^G-[A-Z0-9]{6,15}$/.test(value);
}

export function startAnalytics(){
 if(!import.meta.env.PROD||!validMeasurementId(measurementId))return;
 window.dataLayer=window.dataLayer||[];
 window.gtag=(command,...args)=>{window.dataLayer.push([command,...args]);};
 window.gtag('js',new Date());
 window.gtag('config',measurementId,{send_page_view:false,anonymize_ip:true});
 window.gtag('event','page_view',{
  page_title:document.title,
  page_location:`${location.origin}${location.pathname}`,
  page_path:location.pathname,
 });
 const script=document.createElement('script');
 script.async=true;
 script.src=`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
 document.head.append(script);
}
