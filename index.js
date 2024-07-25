const express = require("express");
const dns = require("dns");
const { exec } = require("child_process");

const app = express();
const port = 3000;

app.use(express.json());

app.get("/dns-records/text", async (req, res) => {
  const { domain } = req.query;

  try {
    const command = "nslookup -type=txt " + domain;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }

      // Print the output of the command
        console.log(`stdout:\n${stdout}`);
        console.error(`stderr:\n${stderr}`);

      const extractedValues = extractTxtValues(stdout);
        console.log(extractedValues);

      const responsedata = {
        data: extractedValues,
      };
      res.json(responsedata);
    });
    // const records = await resolveDnsRecords(domain);
    // res.json(records);
  } catch (error) {
    console.error("Error fetching DNS records:", error);
    res.status(500).json({ error: "Failed to fetch DNS records" });
  }
});

function extractTxtValues(input) {
  const regex = /text\s*=\s*"([^"]+)"/g;
  const values = [];
  let match;

  while ((match = regex.exec(input)) !== null) {
    values.push(match[1]);
  }

  return values;
}



app.get("/dns-records/ns", async (req, res) => {
  const { domain } = req.query;

  try {
    const command = "nslookup -type=ns " + domain;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }

      // Print the output of the command
      // console.log(`stdout:\n${stdout}`);
      // console.error(`stderr:\n${stderr}`);

      const extractedValues = extractNameservers(stdout);
      // console.log(extractedValues);

      const responsedata = {
        data: extractedValues,
      };
      res.json(responsedata);
    });
    // const records = await resolveDnsRecords(domain);
    // res.json(records);
  } catch (error) {
    console.error("Error fetching DNS records:", error);
    res.status(500).json({ error: "Failed to fetch DNS records" });
  }
});

function extractNameservers(input) {
  const lines = input.split(/\r?\n/);
  const nameservers = [];

  lines.forEach((line) => {
    const match = line.match(/nameserver = (.+)/);
    if (match) {
      nameservers.push(match[1]);
    }
  });

  return nameservers;
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
