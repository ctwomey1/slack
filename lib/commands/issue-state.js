const Channel = require('../slack/channel');
const cache = require('../cache');
const { Issue } = require('../messages/issue');

module.exports = state => async (req, res) => {
  const { gitHubUser, slackWorkspace, command } = res.locals;
  const { owner, repo, number } = res.locals.resource;

  const channel = new Channel({
    id: command.channel_id,
    cache,
    client: slackWorkspace.client,
  });

  const { data: issue } = await gitHubUser.client.issues.edit({
    owner,
    repo,
    number,
    state,
    headers: { accept: 'application/vnd.github.html+json' },
  });

  await command.respond({ response_type: 'in_channel' });

  await channel.rollup(new Issue({
    issue,
    repository: { full_name: `${owner}/${repo}` },
    eventType: `issues.${state === 'open' ? 'opened' : 'closed'}`,
  }));
};