import mongoose from "mongoose";

const AdditionalAffiliationSchema = new mongoose.Schema({
  department:  { type: String, default: "" },
  institution: { type: String, default: "" },
}, { _id: false });

const CoAuthorSchema = new mongoose.Schema({
  name:                   { type: String, default: "" },
  department:             { type: String, default: "" },
  orgSelect:              { type: String, default: "" },
  organization:           { type: String, default: "" },
  email:                  { type: String, default: "" },
  authorRole:             { type: String, default: "" },
  collabType:             { type: String, default: "" },
  country:                { type: String, default: "India" },
  additionalAffiliations: { type: [AdditionalAffiliationSchema], default: [] },
}, { _id: false });

const PaperSchema = new mongoose.Schema(
  {
    /* Acknowledgement */
    ackNumber: { type: String, unique: true, required: true },

    /* Personal */
    prefix:       { type: String, default: "" },
    name:         { type: String, required: true, trim: true },
    empId:        { type: String, default: "" },          // optional — removed from form
    designation:  { type: String, required: true },
    department:   { type: String, required: true },
    orgSelect:    { type: String, default: "" },
    organization: { type: String, default: "" },
    phone:        { type: String, default: "" },
    email:        { type: String, required: true, lowercase: true, trim: true },

    /* Paper */
    paperTitle:  { type: String, required: true, trim: true },
    paperType:   { type: String, required: true },
    articleType: { type: String, default: "" },
    domainType:  { type: String, default: "" },
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

    /* DOI */
    doi:               { type: String, default: "" },
    preprintAvailable: { type: String, default: "" },

    /* File */
    fileName: { type: String, default: "" },
  },
  { timestamps: true }
);

PaperSchema.index(
  { paperTitle: 1, name: 1 },
  { unique: false }
);

export default mongoose.model("Paper", PaperSchema);
