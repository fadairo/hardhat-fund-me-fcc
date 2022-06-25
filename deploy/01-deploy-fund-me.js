const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")
//
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    console.log(`ChainId is: ${chainId}`)

    // if chainId is X use address Y
    // const ethUSDPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]

    let ethUSDPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUSDPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUSDPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    console.log(`Address is: ${ethUSDPriceFeedAddress}`)

    // deploy mock

    // when using localhost or hardhat network, we want to use a 'mock'
    const args = [ethUSDPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // pricefeedAddress
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }
    log("------------------------------------------------------------")
}

module.exports.tags = ["all", "fundMe"]
