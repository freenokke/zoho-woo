import express from 'express'
import { engine } from 'express-handlebars'
import pkg from "@woocommerce/woocommerce-rest-api";
import axios from 'axios';
import { ck, cs, url } from './shared/consts/woocomerce.js';
import { clientID, clientSecret, redirectUri, accountID } from './shared/consts/zoho.js';
const WooCommerceRestApi = pkg.default;
import { checkUser } from './shared/api/zoho/auth.js';
import { sendIMGtoWPMedia } from './shared/api/wp/wp.js';
import { getZohoItemIMG, updateZohoItemById } from './shared/api/zoho/zoho.js';

const app = express()
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(express.json())

const Woo = new WooCommerceRestApi({
  url: url,
  consumerKey: ck,
  consumerSecret: cs,
  version: 'wc/v3',
})

app.all('/auth', (req, res) => {
  res.redirect(`https://accounts.zoho.com/oauth/v2/auth?scope=ZohoInventory.FullAccess.all&client_id=${clientID}&response_type=code&redirect_uri=${redirectUri}&access_type=offline&prompt=consent`)
})

app.all('/auth/redirect', async (req, res) => {
  try {
    const { code } = req.query;
    const axiosResponse = await axios.post(`https://accounts.zoho.com/oauth/v2/token?code=${code}&client_id=${clientID}&client_secret=${clientSecret}&redirect_uri=${redirectUri}&grant_type=authorization_code`)
    await checkUser(axiosResponse.data);
    res.sendStatus(200)
  } catch (error) {
    console.log(error)
    res.status(500).send(error.message)
  }
})

app.post('/inventory/created', async (req, res) => {
  console.log(req.body)
  const { image_name, sku, image_type, unit, item_id, name, description, rate, package_details, available_stock } = req.body.item;
  const { weight_unit, length, width, weight, dimension_unit, height } = package_details;
  try {
    const bl = await getZohoItemIMG(item_id)
    const fd = new FormData();
    fd.append("file", bl, image_name);
    const retrieveMediaURL = await sendIMGtoWPMedia(fd)
    const { id, source_url } = retrieveMediaURL.data
    const response = await Woo.post('products', {
      name,
      status: 'draft',
      regular_price: rate.toString(),
      sku,
      description,
      weight: weight.toString(),
      dimensions: {
        length: length.toString(),
        width: width.toString(),
        height: height.toString()
      },
      images: [
        {
          id,
          src: source_url,
        }
      ]
    });

    await updateZohoItemById(item_id, {
      custom_fields: [
        {
          api_name: "cf_woocommerce",
          value: response.data.id
        }
      ]
    })
    res.sendStatus(200);
  } catch (error) {
    console.log(error)
  }
})

app.post('/inventory/updated', async (req, res) => {
  console.log(req.body)
  const { image_name, sku, image_type, unit, item_id, name, description, rate, package_details, available_stock, custom_field_hash } = req.body.item;
  const { weight_unit, length, width, weight, dimension_unit, height } = package_details;
  const { cf_woocommerce } = custom_field_hash;
  try {
    const bl = await getZohoItemIMG(item_id)
    console.log(bl)
    console.log(image_name)
    const fd = new FormData();
    fd.append("file", bl, image_name);
    const retrieveMediaURL = await sendIMGtoWPMedia(fd)
    const { id, source_url } = retrieveMediaURL.data
    await Woo.put(`products/${cf_woocommerce}`, {
      name,
      regular_price: rate.toString(),
      sku,
      description,
      weight: weight.toString(),
      dimensions: {
        length: length.toString(),
        width: width.toString(),
        height: height.toString()
      },
      images: [
        {
          id,
          src: source_url,
        }
      ]
    });
    res.sendStatus(200);
  } catch (error) {
    console.log(error)
  }
})


app.listen(3000, () => {
  console.log('Server started')
})