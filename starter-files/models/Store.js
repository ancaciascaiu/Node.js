const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true,
		required: 'Please enter a store name!'
	},
	slug: String,
	description: {
		type: String,
		trim: true
	},
	tags: [String],
	created: {
		type: Date,
		default: Date.now
	},
	location: {
		type: {
			type: String,
			default: 'Point'
		},
		coordinates: [{
			type: Number,
			required: 'You must supply coordinates!'
		}],
		address: {
			type: String,
			required: 'You must supply an address!'
		}
	},
	photo: String
});

storeSchema.pre('save', async function(next) {
	if(!this.isModified('name')) {
		next(); //skip it
		return; //stop this function from running
	}
	this.slug = slug(this.name);
	// find other stores that have a slug of anca, anca-1, anca-2
	const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
	const storesWithSlug = await this.constructor.find({ slug: slugRegEx });
	if(storesWithSlug.length) {
		this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
	}
	next();
})

storeSchema.statics.getTagsList = function() {
	return this.aggregate([
		{ $unwind: '$tags' }, //unwins the tags from the objects they belong to
		{ $group: { _id: '$tags', count: { $sum: 1} } }, //take existing tags by id (=like reduce) and count
		{ $sort: { count: -1 } } //sort by most popular, descending
	]);
}

module.exports = mongoose.model('Store', storeSchema);
