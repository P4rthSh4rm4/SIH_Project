const app = {
  evaluation: {
    overall_score: 60,
    recommendation: "Proceed to Offer"
  },
  offer: null
};

const result = (!app.offer || !app.offer.id || app.offer.offer_status === 'draft') ? (
  app.evaluation?.recommendation && app.evaluation.recommendation.toLowerCase() !== 'reject' && (
    "BUTTON RENDERED"
  )
) : (
  "BADGE RENDERED"
);

console.log(result);
