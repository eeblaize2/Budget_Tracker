let db;

const request = indexedDB.open('offline_budget',1);

request.onupgradeneeded= (event)=>{
    db= event.target.result
    db.createObjectStore('pending_transactions', {autoIncrement:true})
};

request.onsuccess= (event)=>{
    db= event.target.result
    //if online check database
    if(navigator.onLine){
        checkDB()
    }

};

request.onerror= (event)=>{
    console.log(`Something went wrong: ${event.target.errorCode}`)
};

const saveRecord= (record)=>{
    const transaction= db.transaction(['pending_transactions'], 'readwrite')
    const store= transaction.objectStore('pending_transactions')
    store.add(record)
};

const checkDB= ()=>{
    const transaction= db.transaction(['pending_transactions'], 'readwrite')
    const store= transaction.objectStore('pending_transactions')
    const offlineEntries= store.getAll()
    offlineEntries.onsuccess= ()=>{
        if(offlineEntries.result.length>0){
            fetch("/api/transaction/bulk", {
              method: 'POST', 
              body: JSON.stringify(offlineEntries.result),
              headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json"
              }

            })
            .then(response=>response.json())
            .then(()=>{
                const transaction= db.transaction(['pending_transactions'], 'readwrite')
                const store= transaction.objectStore('pending_transactions')
                store.clear()

            })
        }
    }
}
window.addEventListener('online', checkDB)