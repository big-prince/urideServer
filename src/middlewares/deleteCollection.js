const deleteAllDocuments = async (Model) => {
  try {
    const result = await Model.deleteMany({});
    console.log(`${result.deletedCount} documents were deleted.`);
  } catch (err) {
    console.error("Error deleting documents:", err);
  }
};
export default deleteAllDocuments;
