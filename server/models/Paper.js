import mongoose from "mongoose";

const CoAuthorSchema = new mongoose.Schema({
  prefix:       { type: String, default: "" },
  name:         { type: String, default: "" },
  department:   { type: String, default: "" },
  organization: { type: String, default: "" },
  contact:      { type: String, default: "" },
  email:        { type: String, default: "" },
  authorRole:   { type: String, default: "" },   // First Author / Co-Author / Corresponding Author
  collabType:   { type: String, default: "" },   // National / International
  country:      { type: String, default: "India" },
}, { _id: false });

const PaperSchema = new mongoose.Schema(
  {
    /* Acknowledgement */
    ackNumber: { type: String, unique: true, required: true },

    /* Personal */
    prefix:      { type: String, required: true },
    name:        { type: String, required: true, trim: true },
    empId:       { type: String, required: true, trim: true },
    designation: { type: String, required: true },
    department:  { type: String, required: true },
    phone:       { type: String, required: true },
    email:       { type: String, required: true, lowercase: true, trim: true },

    /* Paper */
    paperTitle:  { type: String, required: true, trim: true },
    paperType:   { type: String, required: true },
    articleType: { type: String, required: true },
    domainType:  { type: String, required: true },
    authorType:  { type: String, required: true },
    authors:     { type: [CoAuthorSchema], default: [] },

    /* Journal */
    journal:        { type: String, required: true },
    publisher:      { type: String, required: true },
    publisherType:  { type: String, default: "" },
    publishingDate: { type: String, required: true },
    accessType:     { type: String, default: "" },
    openAccessAmount: { type: String, default: "" },
    indexing:       { type: String, required: true },
    quartile:       { type: String, default: "" },

    /* DOI — mandatory from frontend */
    doi:               { type: String, default: "" },
    preprintAvailable: { type: String, default: "" },

    /* File */
    fileName: { type: String, default: "" },
  },
  { timestamps: true }
);

/* Case-insensitive duplicate check index */
PaperSchema.index(
  { paperTitle: 1, name: 1 },
  { unique: false }  // uniqueness enforced in route logic with normalized comparison
);

export default mongoose.model("Paper", PaperSchema);
