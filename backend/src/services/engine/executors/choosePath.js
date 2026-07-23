async function execute({ context }) {
  const { category } = context.classify_issue;

  return { output: { category }, outcome: category };
}

module.exports.execute = execute;
