// console.log('hello from the browser JavaScript')

function addDeleteFunction() {
document.querySelectorAll('.delete-review-link').forEach( function( element) {
		element.addEventListener('click', deleteReview)})
}

function deleteReview(event) {
	console.log(event.target.dataset.review_id)
	let confirmation = confirm("Delete this review?")
	if (confirmation) {
		fetch('http://127.0.0.1:3000/review', {
			method: 'delete', 
			headers: {
				"Content-Type": "application/json"
				},
			body: JSON.stringify({id: event.target.dataset.review_id}),
			credentials: 'include'
		}).then( () => {
			location.reload(true)
		})
	}
}