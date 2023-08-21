const pb = { // Make sure to update these for Umbra server
    le: '<:le:1143268645208850494>',
    me: '<:me:1143268644730716160>',
    re: '<:re:1143268643208183930>',
    lf: '<:lf:1143269035874730115>',
    mf: '<:mf:1143269033144234114>',
    rf: '<:rf:1143269031663636481>',
  };
  
  function formatResults(upvotes = [], downvotes = []) {
    const totalVotes = upvotes.length + downvotes.length;
    const progressBarLength = 14;
    const filledSquares = Math.round((upvotes.length / totalVotes) * progressBarLength) || 0;
    const emptySquares = progressBarLength - filledSquares || 0;
  
    if (!filledSquares && !emptySquares) {
      emptySquares = progressBarLength;
    }
  
    const upPercentage = (upvotes.length / totalVotes) * 100 || 0;
    const downPercentage = (downvotes.length / totalVotes) * 100 || 0;
  
    const progressBar =
      (filledSquares ? pb.lf : pb.le) +
      (pb.mf.repeat(filledSquares) + pb.me.repeat(emptySquares)) +
      (filledSquares === progressBarLength ? pb.rf : pb.re);
  
    const results = [];
    results.push(
      `👍 ${upvotes.length} upvotes (${upPercentage.toFixed(1)}%) • 👎 ${
        downvotes.length
      } downvotes (${downPercentage.toFixed(1)}%)`
    );
    results.push(progressBar);
  
    return results.join('\n');
  }
  
  module.exports = formatResults;